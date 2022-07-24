import {
    HttpException,
    HttpStatus,
    Injectable,
} from '@nestjs/common'
import { Parser } from 'json2csv'
import * as _ from 'lodash'
import {
    forkJoin,
    from,
    Observable,
    of,
} from 'rxjs'
import {
    bufferCount,
    concatMap,
    filter,
    map,
    mergeMap,
    reduce,
    tap,
    toArray,
} from 'rxjs/operators'
import { IConfig } from '../../common/interface/config.interface'
import {
    ITransactionLog,
    PaymentStatus as LogPaymentStatus,
    PaymentType,
} from '../../common/interface/transaction-log.interface'
import {
    INode,
    NodeStatus,
} from '../networking/interface/model.interface'
import { INetworkingRepository } from '../networking/interface/repository.interface'
import { ITransactionLogRepository } from './interface/repository.interface'
import {
    IReportService,
    PaymentStatus,
} from './interface'
import { ITransaction } from './interface/transaction-log.schema'

@Injectable()
export class ReportService implements IReportService {
    constructor(
        private readonly _networkingRepository: INetworkingRepository,
        private readonly _logRepository: ITransactionLogRepository,
        private readonly _config: IConfig,
    ) {
    }

    public getSummaryTransactionReport(start: Date, end: Date): Observable<any> {
        const query = {
            paymentStatus: PaymentStatus.Unpaid,
            nodeStatus: NodeStatus.Active,
        }
        const optionsHeadLess = {header: false}
        const json2csvParser = new Parser(optionsHeadLess)

        return this._getTransactionByTiming(start, end, query).pipe(
            map((rec: any) => {
                return {
                    bankAccount: rec.bankAccount,
                    bankName: rec.bankName,
                    benefit: rec.benefit,
                    paid: 'N',
                    paymentDate: '',
                }
            }),
            reduce((records: any[], item: any) => {
                const code = item.bankAccount
                if (_.isNil(records[code])) {
                    records[code] = item
                } else {
                    records[code].benefit = records[code].benefit + item.benefit
                }
                return records
            }, {}),
            map(raw => {
                raw = _.flatMap(raw)
                return json2csvParser.parse(raw) + '\n'
            }),
            reduce((str, current) => str + current, ''),
            map(csv => {
                const option = {
                    bankAccount: 'BankAccount',
                    bankName: 'BankName',
                    benefit: 'Benefit',
                    paid: 'Paid',
                    paymentDate: 'PaymentDate',
                }
                const header = json2csvParser.parse(option)
                return header + '\n' + csv
            }),
        )
    }

    public getMonthlyTransactionReport(start: Date, end: Date): Observable<any> {
        const query = {
            paymentStatus: PaymentStatus.Unpaid,
            nodeStatus: NodeStatus.Active,
        }
        const optionHeadLess = {header: false}
        const json2csvParser = new Parser(optionHeadLess)

        return this._getTransactionByTiming(start, end, query).pipe(
            map(raw => {
                return json2csvParser.parse(raw) + '\n'
            }),
            reduce((str, current) => str + current, ''),
            map(csv => {
                const optionHeader = {
                    code: 'Code',
                    bankAccount: 'BankAccount',
                    bankName: 'BankName',
                    license: 'Plate',
                    benefit: 'Benefit',
                    type: 'Type',
                    from: 'From',
                    paid: 'Paid',
                    paymentDate: 'PaymentDate',
                }
                const headers = json2csvParser.parse(optionHeader)
                return headers + '\n' + csv
            }),
        )
    }

    public importPaymentStatus(records: ITransaction[], operator?: string) {
        return of(records).pipe(
            mergeMap(rawRecords => {
                const filteredRecords = _.filter(rawRecords, rec => rec.Type === 'New')

                let ids = _.map(filteredRecords, (individual) => individual.Code)

                ids = _.uniq(ids)
                ids = _.sortBy(ids)

                return this._networkingRepository.getByMultipleId(ids).pipe(
                    filter(model => model.getPaymentStatus() !== PaymentStatus.Paid),
                    toArray(),
                    map((queryData) => {
                        const queryIds = queryData.map(data => data.getId())
                        if (queryData.length !== ids.length) {
                            const diff = _.difference(ids, queryIds)
                            throw new HttpException(
                                `Some New ID may have set as Paid: ${diff}`,
                                HttpStatus.BAD_REQUEST,
                            )
                        }
                    }),
                )
            }),
            mergeMap(() => from(records)),
            bufferCount(50),
            concatMap((buffer: ITransaction[]) => {
                let ids = _.map(
                    buffer,
                    (individual) => individual.Code)
                    .concat(
                        _.map(buffer, individual => individual.From),
                    )
                ids = _.remove(ids)
                ids = _.uniq(ids)
                ids = _.sortBy(ids)

                return this._networkingRepository.getByMultipleId(ids).pipe(
                    reduce((total, model) => {
                        return ++total
                    }, 0),
                    tap(total => {
                        if (total !== ids.length) {
                            throw new HttpException(
                                'ID Mismatched',
                                HttpStatus.BAD_REQUEST,
                            )
                        }
                    }),
                    map(() => buffer),
                )
            }),
            toArray(),
            map(all => _.flatten(all)),
            map((buffer: ITransaction[]): ITransactionLog[] => {
                return buffer.map(row => {
                    const paymentType = row.Type === 'New' ? PaymentType.NEW : PaymentType.REFER
                    const paymentStatus = row.Paid === 'Y' ? LogPaymentStatus.PAID : LogPaymentStatus.UNPAID

                    const log: ITransactionLog = {
                        bankAccount: row.BankAccount,
                        bankName: row.BankName,
                        benefit: row.Benefit,
                        code: row.Code,
                        paymentType,
                        plate: row.Plate,
                        referenceCode: row.From,
                        operator,
                        paymentStatus,
                        paymentDate: new Date(row.PaymentDate),

                    }
                    return log
                })
            }),
            mergeMap((logs: ITransactionLog[]) => {
                return this._logRepository.createLogs(logs).pipe(
                    mergeMap(() => from(logs)),
                    reduce((ids: any[], log: ITransactionLog) => {
                        if (log.paymentType === PaymentType.NEW && log.paymentStatus === LogPaymentStatus.PAID) {
                            ids.push(log.code)
                        }
                        return _.uniq(ids)
                    }, []),
                    concatMap((ids: string[]) => {
                        return this._networkingRepository.getByMultipleId(ids)
                    }),
                    concatMap((model: INode) => {
                        model.setPaymentStatus(PaymentStatus.Paid)
                        return this._networkingRepository.update(model)
                    }),
                    map(() => logs),
                )
            }),
            map((logs: ITransactionLog[]) => {
                return logs.map(log => ({
                    code: log.code,
                    bankAccount: log.bankAccount,
                    bankName: log.bankName,
                }))
            }),
        )
    }

    public getYearlyProfitTransaction(code: string, fullYear: number): Observable<any> {
        return this._logRepository.queryLogsByCode(code, fullYear).pipe(
            reduce((ids: any[], node: ITransactionLog) => {
                const paymentDate = node.paymentDate
                const getMonth = new Date(paymentDate).getMonth()
                ids.push({
                    month: getMonth,
                    benefit: _.toNumber(node.benefit),
                })
                return ids
            }, []),
            map(rec => {
                return _.groupBy(rec, 'month')
            }),
            reduce((benefit: any[], rec) => {
                for (let i = 0; i < 12; i++) {
                    const b = _.sumBy(rec[i], 'benefit')
                    benefit.push(b)
                }
                return benefit
            }, []),
        )
    }

    private _getTransactionByTiming(
        start: Date,
        end: Date,
        query,
    ): Observable<any> {
        return this._networkingRepository.queryByDuration(start, end, query).pipe(
            mergeMap((node: INode) => {
                const parents = node.getParents()
                return forkJoin([
                    of(node),
                    this._networkingRepository.getByMultipleId(parents).pipe(toArray()),
                ])
            }),
            mergeMap((results: any[]) => {
                const refNode = results[0]
                refNode.benefit = this._config.node.dp
                refNode.type = 'New'
                let parents: any[] = results[1]
                parents = parents.map((parent) => {
                    parent.benefit = this._config.node.rp
                    parent.type = 'Referred'
                    parent.from = refNode.getId()
                    return parent
                })
                const all = _.concat([refNode], parents)
                return from(all)
            }),
            map((rec: any) => {
                return {
                    code: rec.getId(),
                    bankAccount: rec.getBankAccount().accountNumber,
                    bankName: rec.getBankAccount().bankName,
                    license: rec.getPlate().name + rec.getPlate().province,
                    benefit: rec.benefit,
                    type: rec.type,
                    from: rec.from,
                    paid: 'N',
                    paymentDate: '',
                }
            }),
        )
    }
}
