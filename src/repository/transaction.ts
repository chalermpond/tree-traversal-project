import { MongoRepository } from '../common/mongo-repository'
import { ITransactionRepository } from '../service/transaction/interface/repository.interface'
import {
    Db,
    ObjectId,
} from 'mongodb'
import { ITransactionModel } from 'src/service/transaction/interface'
import { IRepositoryMapping } from '../common/interface/repository.interface'
import {
    HttpException,
    HttpStatus,
    Injectable,
} from '@nestjs/common'
import { TransactionModel } from '../service/transaction/transaction.model'
import * as _ from 'lodash'
import {
    from,
    Observable,
} from 'rxjs'
import { map } from 'rxjs/operators'
import {
    RepositoryError,
    RepositoryErrorType,
} from '../common/error'

interface ITransactionSchema {
    _id: ObjectId
    created: number
    updated: number
    status: string
    message: string
}

@Injectable()
export class TransactionMongoRepository extends MongoRepository<ITransactionModel> implements ITransactionRepository {
    constructor(db: Db) {
        super(db.collection('transaction'), new TransactionRepositoryMapping())
    }

    save(model: ITransactionModel): Observable<{ id: string }> {
        const document = this._mapper.serialize(model)
        return from(this._collection.insertOne(document)).pipe(
            map((resp: any) => {
                if (_.get(resp, 'result.n') === 1) {
                    return {
                        id: resp.insertedId,
                    }
                }
                throw new RepositoryError(
                    RepositoryErrorType.InsertError,
                    `Can not save new model`,
                )
            }),
        )
    }

    find(input: string): Observable<any> {
        const query = {
            _id: new ObjectId(input),
        }
        return from(this._collection.findOne(query)).pipe(
            map(resp => {
                if (_.isNil(resp)) {
                    throw new HttpException(
                        `transaction does not exist`,
                        HttpStatus.BAD_REQUEST,
                    )
                }
                return resp
            }),
        )
    }

    update(model: any): Observable<any> {
        const document = this._mapper.serialize(model)
        return from(this._collection.updateOne(
            {
                _id: new ObjectId(model.getId()),
            }, {
                $set: document,
            }),
        )
    }

    public retrieve(
        start: Date,
        end: Date,
        status: string,
    ): Observable<any> {
        const query = {
            created: {
                $gte: end,
                $lte: start,
            },
            status,
        }
        const cursor = this._collection.find(query)
        return this.toObservable(cursor)
    }
}

export class TransactionRepositoryMapping implements IRepositoryMapping<ITransactionModel> {
    deserialize(obj: ITransactionSchema): ITransactionModel {
        if (_.isNil(obj)) {
            return null
        }
        const model = new TransactionModel(
            obj.created,
        )
        model.setId(obj._id.toHexString())
        return _.assign(model, {
            _created: obj.created,
            _update: obj.updated,
            _status: obj.status,
            _message: obj.message,
        })
    }

    serialize(model: ITransactionModel): any {
        return {
            _id: _.isNil(model.getId()) ? undefined : new ObjectId(model.getId()),
            created: model.getCreateDate(),
            updated: model.getUpdateDate(),
            status: model.getStatus(),
            message: model.getMessage(),
        }
    }
}
