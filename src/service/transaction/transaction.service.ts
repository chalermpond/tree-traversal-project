import {
    ITransactionModel,
    ITransactionService,
    ITransactionValidator,
} from './interface'
import {
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
} from '@nestjs/common'
import { ProviderName } from '../../provider'
import { ITransactionRepository } from './interface/repository.interface'
import { TransactionModel } from './transaction.model'
import {
    from,
    Observable,
} from 'rxjs'
import {
    map,
    mergeMap,
    tap,
    toArray,
} from 'rxjs/operators'
import * as _ from 'lodash'
import { PolicyDto } from '../policy/policy.dto'
import { ReportDto } from '../report/report.dto'

const {
    TransactionServiceProvider,
} = ProviderName

enum status {
    updated = 'updated',
    new = 'new',
    success = 'success',
    fail = 'fail',
}

@Injectable()
export class TransactionService implements ITransactionService {
    constructor(
        @Inject(TransactionServiceProvider)
        private readonly _transactionRepository: ITransactionRepository,
    ) {
    }

    createReferral(): Observable<any> {
        const model = this._createTranscationModel({
            created: new Date(),
            updated: null,
            message: 'transaction id created',
            status: status.new,
        })
        return this._transactionRepository.save(model).pipe(
            map(resp => ({
                transaction: resp.id,
            })),
        )
    }

    updateSuccess(id: string, message: string): Observable<any> {
        if (this._isHex(id) === true) {
            throw new HttpException(`transaction id invalid`, HttpStatus.BAD_REQUEST)
        }
        return from(this._transactionRepository.find(id).pipe(
            map(res => {
                const model = this._createTranscationModel({
                    created: res.created,
                    message,
                    status: status.success,
                    updated: new Date(),
                })
                model.setId(id)
                return model
            }),
            mergeMap(document => {
                return this._transactionRepository.update(document)
            }),
            map(() => ({
                status: status.updated,
            })),
        ))
    }

    updateFail(id: string, message: string): Observable<any> {
        if (this._isHex(id) === true) {
            throw new HttpException(`transaction id invalid`, HttpStatus.BAD_REQUEST)
        }

        return from(this._transactionRepository.find(id).pipe(
            tap(res => {
                if (res.status !== 'new') {
                    throw new HttpException(
                        `transaction invalid`,
                        HttpStatus.BAD_REQUEST,
                    )
                }
                return res
            }),
            map(res => {
                const model = this._createTranscationModel({
                    created: res.created,
                    message,
                    status: status.fail,
                    updated: new Date(),
                })
                model.setId(id)
                return model
            }),
            map(document => {
                return this._transactionRepository.update(document)
            }),
            map(() => ({
                status: status.updated,
            })),
        ))
    }

    public queryTransaction(start: Date, end: Date, tstatus: string): Observable<any> {
        return this._transactionRepository.retrieve(start, end, tstatus).pipe(
            tap((recs: ITransactionModel) => {
                if (_.isNil(recs)) {
                    throw new HttpException(
                        `transaction log does not exist`,
                        HttpStatus.NOT_FOUND,
                    )
                }
            }),
            map(ReportDto.toTransactionDto),
            toArray(),
        )
    }

    private _createTranscationModel(model: ITransactionValidator): TransactionModel {
        const newModel = new TransactionModel(model.created)
        newModel.setCreateDate(model.created)
        newModel.setUpdateDate(model.updated)
        newModel.setMessage(model.message)
        newModel.setStatus(model.status)
        return newModel
    }

    private _isHex(input) {
        const stringInput = parseInt(input, 16)
        return (stringInput.toString(16) === input)
    }

}
