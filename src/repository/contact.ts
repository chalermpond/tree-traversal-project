import { Injectable } from '@nestjs/common'
import { MongoRepository } from '../common/mongo-repository'
import {
    Db,
    ObjectId,
    ObjectID,
} from 'mongodb'
import {
    from,
    Observable,
} from 'rxjs'
import { IRepositoryMapping } from '../common/interface/repository.interface'
import * as _ from 'lodash'
import { IContactModel } from '../service/contact/interface/model.interface'
import { IContactRepository } from '../service/contact/interface/repository.interface'
import { map } from 'rxjs/operators'
import { ContactModel } from '../service/contact/contact.model'
import {
    RepositoryError,
    RepositoryErrorType,
} from '../common/error'

interface IContactSchema {
    _id: ObjectId
    title: string
    name: string
    phone: string
    workPhone: string
    email: string
    line: string
    facebook: string
    twitter: string
    address: string
    company: string
    tags: string[]
}

@Injectable()
export class ContactMongoRepository extends MongoRepository<IContactModel> implements IContactRepository {
    constructor(db: Db) {
        super(db.collection('contact'), new ContactMongoRepositoryMapping())
    }

    public save(model: IContactModel): Observable<{ id: string }> {
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
                    `Cannot save new model`,
                )
            }),
        )
    }

    public getById(id: string): Observable<IContactModel> {
        const query = {
            _id: new ObjectID(id),
        }
        return from(this._collection.findOne(query)).pipe(
            map((doc: any) => this._mapper.deserialize(doc)),
        )
    }

    public update(model: IContactModel): Observable<any> {
        const document = this._mapper.serialize(model)

        return from(this._collection.updateOne(
            {
                _id: new ObjectId(model.getId()),
            }, {
                $set: document,
            }),
        ).pipe(
            map((resp: any) => {
                if (_.get(resp, 'result.n') === 1) {
                    return {
                        id: model.getId(),
                    }
                }
                throw new RepositoryError(
                    RepositoryErrorType.UpdateError,
                    `Update Error ${model.getId()}`,
                )
            }),
        )
    }

    public delete(model: IContactModel): Observable<any> {
        return from(this._collection
            .deleteOne(
                {
                    _id: new ObjectId(model.getId()),
                },
            ),
        )
    }
}

export class ContactMongoRepositoryMapping implements IRepositoryMapping<IContactModel> {
    public deserialize(obj: IContactSchema): IContactModel {
        if (_.isNil(obj)) {
            return null
        }
        const model = new ContactModel(obj.name)
        model.setId(obj._id.toHexString())
        return _.assign(model,
            {
                _tags: obj.tags,
                _address: obj.address,
                _company: obj.company,
                _email: obj.email,
                _facebook: obj.facebook,
                _line: obj.line,
                _phone: obj.phone,
                _title: obj.title,
                _twitter: obj.twitter,
                _workPhone: obj.workPhone,
            },
        )
    }

    public serialize(model: IContactModel): IContactSchema {
        return {
            _id: _.isNil(model.getId()) ? undefined : new ObjectId(model.getId()),
            title: model.getTitle() || '',
            name: model.getFullName(),
            phone: model.getPhone() || '',
            workPhone: model.getWorkPhone() || '',
            email: model.getEmail() || '',
            line: model.getLine() || '',
            facebook: model.getFacebook() || '',
            twitter: model.getTwitter() || '',
            address: model.getAddress() || '',
            company: model.getCompany() || '',
            tags: model.getTags() || [],
        }
    }

}
