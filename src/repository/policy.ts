import { MongoRepository } from '../common/mongo-repository'
import { IPolicyModel } from '../service/policy/interface/model.interface'
import { IPolicyRepository } from '../service/policy/interface/repository.interface'
import {
    HttpException,
    HttpStatus,
    Injectable,
} from '@nestjs/common'
import { Db } from 'mongodb'
import { IRepositoryMapping } from '../common/interface/repository.interface'
import {
    from,
    Observable,
} from 'rxjs'
import * as _ from 'lodash'
import { map } from 'rxjs/operators'
import { PolicyModel } from '../service/policy/policy.model'
import { ICipher } from '../common/interface/cipher.interface'

interface IPolicySchema {
    _id: string
    policy: string
    citizen: string
    name: string
    license: string
    province: string
    create: any
    address: string
    brand: string
    model: string
    chassis: string
    start: string
    expire: string
    doc: string
}

@Injectable()
export class PolicyMongoRepository extends MongoRepository<IPolicyModel> implements IPolicyRepository {
    constructor(
        db: Db,
        private readonly _cipher: ICipher,
    ) {
        super(db.collection('policy'), new PolicyMongoRepositoryMapping(_cipher))
        this._collection.createIndex({citizen: 1})
    }

    save(model: IPolicyModel): Observable<{ id: string }> {
        const document = this._mapper.serialize(model)
        return from(this._collection.insertOne(document)).pipe(
            map((resp: any) => {
                if (_.get(resp, 'result.n') === 1) {
                    return {
                        id: resp.insertedId,
                    }
                }
                throw new HttpException(
                    `Cannot save new model`,
                    HttpStatus.BAD_REQUEST,
                )
            }),
        )

    }

    retrieve(license: string, citizen: string): any {
        const query = {
            license,
            citizen,
        }
        return from(this._collection.findOne(query)).pipe(
            map((resp: any) => {
                if (resp !== null) {
                    return resp
                } else {
                    throw new HttpException('policy not found', HttpStatus.BAD_REQUEST)
                }
            }),
        )

    }

    // TODO IMPROVE
    retrieveByLicense(licenseId: string): any {
        return this._collection.findOne({license: licenseId})
    }

    getById(policy: string): any {
        const query = {_id: policy}
        return from(this._collection.findOne(query)).pipe(
            map((doc: any) => this._mapper.deserialize(doc)),
        )
    }

    getByCitizen(input: string): Observable<IPolicyModel> {
        const ecid = this._cipher.encrypt(input)
        const query = {citizen: ecid}
        const cursor = this._collection.find(query)
        return this.toObservable(cursor)
    }
}

export class PolicyMongoRepositoryMapping implements IRepositoryMapping<IPolicyModel> {
    constructor(
        private readonly _cipher: ICipher,
    ) {
    }

    deserialize(obj: IPolicySchema): IPolicyModel {
        if (_.isNil(obj)) {
            return null
        }
        const model = new PolicyModel(
            obj.policy,
        )
        model.setId(obj._id)
        model.setCitizen(this._cipher.decrypt(obj.citizen))
        return _.assign(model,
            {
                _policy: obj._id,
                _name: obj.name,
                _license: obj.license,
                _address: obj.address,
                _province: obj.province,
                _brand: obj.brand,
                _model: obj.model,
                _chassis: obj.chassis,
                _doc: obj.doc,
                _start: obj.start,
                _expire: obj.expire,
            },
        )
    }

    serialize(model: IPolicyModel): any {
        const ecid = this._cipher.encrypt(model.getCitizen())
        const newModel = {
            _id: model.getPolicyNumber(),
            name: model.getFullName() || '',
            citizen: ecid || '',
            license: model.getLicensePlate() || '',
            create: model.getCreateDate() || '',
            address: model.getAddress() || '',
            province: model.getProvince() || '',
            model: model.getmodel() || '',
            brand: model.getBrand() || '',
            chassis: model.getChassis() || '',
            start: model.getStart() || '',
            expire: model.getExpire() || '',
            doc: model.getDoc() || '',
            birth: model.getBirthDate() || '',
            age: model.getAge() || '',
            career: model.getCareer() || '',
            email: model.getEmail() || '',
            mobile: model.getMobile() || '',
            seat: model.getSeat() || '',
            weight: model.getWeight() || '',
            disp: model.getDist() || '',
            transaction: model.getTransaction() || '',
        }
        return newModel
    }

}
