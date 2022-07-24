import { MongoRepository } from '../common/mongo-repository'
import { IUser } from '../service/user/interface'
import {
    from,
    Observable,
} from 'rxjs'
import { Db } from 'mongodb'
import { UserModel } from '../service/user/user.model'
import { map } from 'rxjs/operators'
import * as _ from 'lodash'
import {
    HttpException,
    HttpStatus,
} from '@nestjs/common'
import { IUserRepository } from '../service/user/interface/repository.interface'
import { IRepositoryMapping } from '../common/interface/repository.interface'
import { ICipher } from '../common/interface/cipher.interface'

export class UserMongoRepository extends MongoRepository<IUser> implements IUserRepository {
    constructor(
        db: Db,
        private readonly _cipher: ICipher,
    ) {
        super(db.collection('user'), new UserMongoRepositoryMapping(_cipher))

    }

    getById(id: string): Observable<IUser> {
        const query = {
            _id: _.toString(id),
        }
        return from(this._collection.findOne(query)).pipe(
            map((doc: any) => this._mapper.deserialize(doc)),
        )
    }

    save(model: IUser): Observable<{ id: string }> {
        const document = this.toDocument(model)
        return from(this._collection.insertOne(document)).pipe(
            map((resp: any) => {
                if (_.get(resp, 'result.n') === 1) {
                    return {
                        id: model.getUserName(),
                    }
                }
                throw new HttpException(`Save Error`, HttpStatus.INTERNAL_SERVER_ERROR)
            }),
        )
    }

    update(model: IUser): Observable<any> {
        const document = this._mapper.serialize(model)

        return from(this._collection.updateOne(
            {
                _id: model.getUserName(),
            }, {
                $set: document,
            }),
        ).pipe(
            map((resp: any) => {
                if (_.get(resp, 'result.n') === 1) {
                    return {
                        id: model.getUserName(),
                    }
                }
                throw new HttpException(`Update Error`, HttpStatus.INTERNAL_SERVER_ERROR)
            }),
        )
    }

    public getByMultipleId(ids: string[]): Observable<IUser> {
        const query = {
            _id: {
                $in: ids.map(_.toString),
            },
        }
        const cursor = this._collection.find(query)
        return this.toObservable(cursor)
    }

}

export class UserMongoRepositoryMapping implements IRepositoryMapping<IUser> {
    constructor(
        private readonly _cipher: ICipher,
    ) {
    }

    public deserialize(object: any): IUser {
        if (_.isNil(object)) {
            return null
        }
        const ecid = this._cipher.decrypt(object.citizen)
        const deSerializedUser = new UserModel()
        Object.assign(deSerializedUser, {
            _name: object.name,
            _user: object._id,
            _id: object._id,
            _salt: object.salt,
            _email: object.email,
            _suspended: object.status === 'suspended',
            _password: object.secret,
            _phone: object.phone,
            _province: object.province,
            _citizen: ecid,
        })
        return deSerializedUser
    }

    public serialize(model: any): any {
        const citizen = this._cipher.encrypt(model.getCitizen())
        return {
            _id: model.getUserName(),
            name: model.getName(),
            email: model.getEmail(),
            status: !!model._suspended ? 'suspended' : 'active',
            secret: model._password,
            salt: model._salt,
            phone: model.getPhone(),
            province: model.getProvince(),
            citizen,
        }
    }

}
