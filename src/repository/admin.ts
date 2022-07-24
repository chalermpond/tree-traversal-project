import { MongoRepository } from '../common/mongo-repository'
import { IAdmin } from '../service/admin/interface'
import { IAdminRepositroy } from '../service/admin/interface/repository.interface'
import {
    from,
    Observable,
} from 'rxjs'
import {
    Db,
    ObjectId,
} from 'mongodb'
import { IRepositoryMapping } from '../common/interface/repository.interface'
import * as _ from 'lodash'
import { AdminModel } from '../service/admin/admin.model'
import { map } from 'rxjs/operators'
import {
    HttpException,
    HttpStatus,
} from '@nestjs/common'

interface IAdminSchema {
    _id: ObjectId
    username: string
    password: string
    email: string
    salt: string
    status: string
}

export class AdminMongoRepository extends MongoRepository<IAdmin> implements IAdminRepositroy {
    constructor(db: Db) {
        super(db.collection('admin'), new AdminMongoRepositoryMapping())
    }

    public getByUsername(input: string): Observable<IAdmin> {
        const query = {
            username: _.toString(input),
        }
        return from(this._collection.findOne(query)).pipe(
            map((doc: any) => this._mapper.deserialize(doc)),
        )
    }

    public save(model: IAdmin): Observable<{ id: string }> {
        const document = this.toDocument(model)
        return from(this._collection.insertOne(document)).pipe(
            map((resp: any) => {
                if (_.get(resp, 'result.n') === 1) {
                    return {
                        id: model.getUsername(),
                    }
                }
                throw new HttpException(`Save Error`, HttpStatus.INTERNAL_SERVER_ERROR)
            }),
        )
    }
}

export class AdminMongoRepositoryMapping implements IRepositoryMapping<IAdmin> {
    public deserialize(obj: IAdminSchema): IAdmin {
        if (_.isNil(obj)) {
            return null
        }
        const model = new AdminModel()
        model.setId(obj._id.toHexString())
        return _.assign(model,
            {
                _username: obj.username,
                _password: obj.password,
                _email: obj.email,
                _status: obj.status,
                _salt: obj.salt,
            })
    }

    public serialize(model: any): IAdminSchema {
        return {
            _id: _.isNil(model.getId()) ? undefined : new ObjectId(model.getId()),
            username: model.getUsername() || '',
            password: model.getPassword() || '',
            email: model.getEmail() || '',
            salt: model._salt,
            status: 'active',
        }
    }
}
