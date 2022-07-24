import {
    Db,
    InsertOneWriteOpResult,
    InsertWriteOpResult,
    ObjectId,
} from 'mongodb'
import {
    from,
    Observable,
} from 'rxjs'
import {
    bufferCount,
    map,
    mergeMap,
    reduce,
} from 'rxjs/operators'

import * as _ from 'lodash'
import { IRepositoryMapping } from '../common/interface/repository.interface'
import {
    ITransactionLog,
    PaymentStatus,
    PaymentType,
} from '../common/interface/transaction-log.interface'
import { MongoRepository } from '../common/mongo-repository'
import { ITransactionLogRepository } from '../service/report/interface/repository.interface'

interface ISchema {
    _id: ObjectId
    operator: string
    code: string
    bankAccount: string
    bankName: string
    plate: string
    benefit: number
    paymentType: PaymentType
    referenceCode: string
    paymentStatus: PaymentStatus
    createdTime: Date,
    paymentDate: Date,
}

export class TransactionLogMongoRepository extends MongoRepository<ITransactionLog> implements ITransactionLogRepository {
    constructor(db: Db) {
        super(db.collection('transactionLog'), new TransactionLogMapping())
    }

    public createLog(log: ITransactionLog) {
        const doc: ISchema = this.toDocument(log)
        const promise = this._collection.insertOne(doc)
        return from(promise).pipe(
            map((result: InsertOneWriteOpResult) => {
                const id = result.insertedId.toHexString()
                return {id}
            }),
        )
    }

    public createLogs(logs: ITransactionLog[]) {
        return from(logs).pipe(
            bufferCount(100),
            mergeMap((bulk: ITransactionLog[]) => {
                const promise = this._collection.insertMany(bulk)
                return from(promise)
            }),
            map((writeResult: InsertWriteOpResult) => {
                return _.values(writeResult.insertedIds).map(oid => oid.toHexString())
            }),
            reduce((ids: string[], current: string[]) => {
                return _.concat(ids, current)
            }, []),
        )
    }

    public queryLogsByCode(input: string, fullYear: number): Observable<any> {
        const query = {
            code: input,
            paymentDate: {
                $gte: new Date(`${fullYear}-01-01`),
                $lte: new Date(`${fullYear}-12-31`),
            },
        }
        const cursor = this._collection.find(query)
        return this.toObservable(cursor)
    }

}

export class TransactionLogMapping implements IRepositoryMapping<ITransactionLog> {
    public deserialize(obj: ISchema): ITransactionLog {
        return {
            bankAccount: obj.bankAccount,
            bankName: obj.bankName,
            benefit: obj.benefit,
            code: obj.code,
            operator: obj.operator,
            paymentStatus: obj.paymentStatus,
            paymentType: obj.paymentType,
            plate: obj.plate,
            referenceCode: obj.referenceCode,
            paymentDate: obj.paymentDate,

        }
    }

    public serialize(model: ITransactionLog): ISchema {
        return {
            _id: undefined,
            bankAccount: model.bankAccount,
            bankName: model.bankName,
            benefit: model.benefit,
            code: model.code,
            createdTime: new Date(),
            operator: model.operator,
            paymentStatus: model.paymentStatus,
            paymentType: model.paymentType,
            plate: model.plate,
            referenceCode: model.referenceCode,
            paymentDate: model.paymentDate,
        }
    }

}
