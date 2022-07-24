import { MongoRepository } from '../common/mongo-repository'
import { IProvinceRepository } from '../service/common/interface/repository.interface'
import { Observable } from 'rxjs'
import {
    AggregationCursor,
    Db,
} from 'mongodb'
import { IRepositoryMapping } from '../common/interface/repository.interface'

import { from } from 'rxjs/internal/observable/from'
import * as _ from 'lodash'
import { ProvinceModel } from '../service/common/province.model'
import { IProvince } from '../service/common/interface/common.interface'

export class ProvinceMongoRepository extends MongoRepository<IProvince> implements IProvinceRepository {
    constructor(db: Db) {
        super(db.collection('province'), new ProvinceMongoRepositoryMapping())
    }

    public getProvinces(): Observable<IProvince> {
        const aggrCursor: AggregationCursor = this._collection.aggregate([
            {
                $group: {
                    _id: '$province_code',
                    province_code: {$first: '$province_code'},
                    province: {$first: '$province'},
                },
            },
            {
                $sort: {
                    _id: 1,
                },
            },
        ])
        return from(this.toObservableFromAggregateCursor(aggrCursor))
    }

}

export class ProvinceMongoRepositoryMapping implements IRepositoryMapping<IProvince> {
    public deserialize(obj: any): any {
        if (_.isNil(obj)) {
            return null
        }
        const model = new ProvinceModel()
        Object.assign(model, {
            _id: obj._id.toString(),
            _code: obj.province_code,
            _name: obj.province,
        })
        return model
    }

    public serialize(model: any): any {
        return null
    }

}
