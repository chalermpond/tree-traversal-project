import * as _ from 'lodash'
import { MongoRepository } from '../common/mongo-repository'
import {
    Db,
    InsertOneWriteOpResult,
    UpdateWriteOpResult,
} from 'mongodb'
import {
    IProfile,
    IUser,
} from '../service/user/interface'
import { IRepositoryMapping } from '../common/interface/repository.interface'
import { ProfileModel } from '../service/user/profile.model'
import {
    IProfileRepository,
    IUserRepository,
} from '../service/user/interface/repository.interface'
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
import {
    HttpException,
    HttpStatus,
} from '@nestjs/common'
import { ICipher } from '../common/interface/cipher.interface'

interface ISchema {
    _id: string
    createdDate: number
    email: string
    name: string
    phone: string
    users: string[]
    lastUpdate: number
}

export class ProfileMongoRepository extends MongoRepository<IProfile> implements IProfileRepository {
    constructor(
        db: Db,
        private readonly _userRepo: IUserRepository,
        private readonly _cipher: ICipher,
    ) {
        super(db.collection('profile'), new ProfileMongoRepositoryMapping(_cipher))
    }

    public getById(id: string): Observable<IProfile> {
        const ecid = this._cipher.encrypt(id)
        const promise: Promise<ISchema> = this._collection.findOne({
            _id: ecid,
        })
        return from(promise).pipe(
            tap(schema => {
                if (_.isNil(schema)) {
                    throw new HttpException('Profile not found',
                        HttpStatus.NOT_FOUND)
                }
            }),
            map(schema => {
                    const users = schema.users
                    const model: IProfile = this.toModel(schema)
                    return {
                        model,
                        users,
                    }
                },
            ),
            mergeMap(({model, users}) => {
                return this._userRepo.getByMultipleId(users).pipe(
                    toArray(),
                    map(userModels => {
                        _.assign(model, {_users: userModels})
                        return model
                    }),
                )
            }),
        )
    }

    public create(profile: IProfile): Observable<IProfile> {
        const schema = this.toDocument(profile)
        const promise = this._collection.insertOne(schema)
        return from(promise).pipe(
            tap((result: InsertOneWriteOpResult) => {
                if (_.get(result, 'result.n') !== 1) {
                    throw new HttpException(`Update Error`, HttpStatus.INTERNAL_SERVER_ERROR)
                }
            }),
            map(() => profile),
        )
    }

    public updateUsers(profile: IProfile): Observable<IProfile> {
        const id = this._cipher.encrypt(profile.getId())
        const users = profile.getUsers()
        const userIds: string[] = _.map(users, (user: IUser) => user.getId())
        const promise = this._collection.updateOne({
            _id: id,
        }, {
            $set: {
                users: userIds,
            },
        })
        return from(promise).pipe(
            tap((result: UpdateWriteOpResult) => {
                if (_.get(result, 'modifiedCount') !== 1) {
                    throw new HttpException(`Update Error`, HttpStatus.INTERNAL_SERVER_ERROR)
                }
            }),
            map(() => profile),
        )
    }

    public updateProfile(profile: IProfile): Observable<IProfile> {
        const id = this._cipher.encrypt(profile.getId())
        const doc: ISchema = this.toDocument(profile)
        delete doc._id

        const promise: Promise<UpdateWriteOpResult> = this._collection.updateOne(
            {
                _id: id,
            },
            {
                $set: {
                    email: doc.email,
                    name: doc.name,
                    phone: doc.phone,
                },
            },
        )
        return from(promise).pipe(
            tap((result: UpdateWriteOpResult) => {
                if (_.get(result, 'modifiedCount') !== 1) {
                    throw new HttpException(`Update Error`, HttpStatus.INTERNAL_SERVER_ERROR)
                }
            }), map(() => profile))
    }

}

class ProfileMongoRepositoryMapping implements IRepositoryMapping<IProfile> {

    constructor(
        private readonly _cipher: ICipher,
    ) {
    }

    public deserialize(obj: ISchema): IProfile {
        if (_.isNil(obj)) {
            return null
        }
        const cid = this._cipher.decrypt(obj._id.toString())
        const model = new ProfileModel(cid)
        _.assign(model, {
            _email: obj.email,
            _name: obj.name,
            _phone: obj.phone,
            _users: obj.users,
        })
        return model
    }

    public serialize(model: IProfile): ISchema {
        const users = _.map(
            model.getUsers(),
            userModel => userModel.getUserName())
        const schema: ISchema = {
            _id: this._cipher.encrypt(model.getId()),
            createdDate: model.getCreatedDate().getTime(),
            email: model.getEmail(),
            name: model.getName(),
            phone: model.getPhone(),
            lastUpdate: Date.now(),
            users,

        }
        return schema
    }

}
