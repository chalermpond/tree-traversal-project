import {
    HttpException,
    HttpStatus,
} from '@nestjs/common'
import * as _ from 'lodash'
import { Db } from 'mongodb'
import {
    from,
    Observable,
} from 'rxjs'
import {
    filter,
    map,
    take,
    tap,
    throwIfEmpty,
} from 'rxjs/operators'
import {
    RepositoryError,
    RepositoryErrorType,
} from '../common/error'
import { ICipher } from '../common/interface/cipher.interface'
import { IRepositoryMapping } from '../common/interface/repository.interface'

import { MongoRepository } from '../common/mongo-repository'
import {
    IBankAccount,
    ILicensePlate,
    INode,
    IPolicy,
    NodeStatus,
    PaymentStatus,
} from '../service/networking/interface/model.interface'
import {
    INetworkingRepository,
    INodeQuery,
} from '../service/networking/interface/repository.interface'
import { NodeModel } from '../service/networking/node.model'

interface ISchema {
    _id: string
    ecid: string
    plate: {
        name: string,
        province: string,
    },
    bankAccount: {
        bank: string,
        account: string,
    }
    status: {
        activate: string,
        payment: string,
    }
    policy: {
        no: string,
        name: string,
        effectiveDate: number,
        expiryDate: number,
    },
    level: number
    parents: string[]
    createdDate: number
    lastUpdate: number
    totalChildren: number
    fullPath: string[]
    originalRef: string
}

export class NetworkingRepository extends MongoRepository<INode> implements INetworkingRepository {

    constructor(
        db: Db,
        private readonly _cipher: ICipher,
    ) {
        super(db.collection('networking'), new NetworkRepositoryMapping(_cipher))
        this._collection.createIndexes([
            {
                key: {
                    parents: 1,
                },
            },
            {
                key: {
                    parents: 1,
                    level: 1,
                },
            },
            {
                key: {
                    'policy.no': 1,
                },
            },
            {
                key: {
                    fullPath: 1,
                },
            },
        ]).then(() => {
            console.log(`indexes created on networking repository`)
        })
    }

    public create(node: INode): Observable<{ id: string }> {
        const schema: ISchema = this.toDocument(node)
        const promise = this._collection.insertOne(schema)
        return from(promise).pipe(
            map((result: any) => {
                if (_.get(result, 'result.n') === 1) {
                    return {
                        id: result.insertedId.toString(),
                    }
                }
                throw new RepositoryError(
                    RepositoryErrorType.InsertError,
                    `Cannot save new model`,
                )
            }),
        )
    }

    public getById(id: string): Observable<INode> {
        const promise = this._collection.findOne({
            _id: id.toString(),
        })
        return from(promise).pipe(
            tap((doc: ISchema) => {
                if (_.isNil(doc)) {
                    throw new HttpException('Resource not found',
                        HttpStatus.NOT_FOUND,
                    )
                }
            }),
            map((doc: ISchema) => this._mapper.deserialize(doc)),
        )
    }

    public getNetwork(root: INode, maxLevel: number): Observable<INode> {
        return undefined
    }

    public save(node: INode): Observable<INode> {
        return undefined
    }

    public update(node: INode): Observable<INode> {
        const schema: ISchema = this.toDocument(node)
        const _id = schema._id
        delete schema._id
        const promise = this._collection.updateOne({_id},
            {
                $set: schema,
            })
        return from(promise).pipe(
            map(() => node),
        )
    }

    public getRoot(): Observable<INode> {
        const promise = this._collection.findOne({
                parents: [],
            },
        )

        return from(promise).pipe(
            tap((schema: ISchema) => {
                if (_.isNil(schema)) {
                    throw new HttpException('Resource not found',
                        HttpStatus.NOT_FOUND,
                    )
                }
            }),
            map((schema: ISchema) => this.toModel(schema)),
        )
    }

    public getChildren(node: INode): Observable<INode> {
        const id = node.getId()
        const query = {
            parents: id,

        }
        const cursor = this._collection.find(query)
        return this.toObservable(cursor)
    }

    public getLeaves(node: INode): Observable<INode> {
        return this.getChildren(node).pipe(
            filter((child: INode) => {
                    const parents = child.getParents()
                    return _.last(parents) === node.getId()
                },
            ),
        )
    }

    public getByVehicleData(plate: string, province: string): Observable<INode> {
        const query = {
            'plate.name': plate,
            'plate.province': province,
        }
        const promise = this._collection.findOne(query)
        return from(promise).pipe(
            tap((doc: ISchema) => {
                if (_.isNil(doc)) {
                    throw new HttpException('Node not found', HttpStatus.NOT_FOUND)
                }
            }),
            map((schema: ISchema) => {
                return this.toModel(schema)
            }),
        )
    }

    public getByCitizen(cid: string): Observable<INode> {
        const query = {
            ecid: cid,
        }
        const cursor = this._collection.find(query)
        return this.toObservable(cursor)
    }

    public getByPolicyId(policyId: string): Observable<INode> {
        const query = {
            'policy.no': policyId,
        }

        const cursor = this._collection.find(query)
        return this.toObservable(cursor)
    }

    public getAvailableNodeFromReference(node: INode): Observable<INode> {
        const id = node.getId()
        const query = {
            fullPath: id,
            totalChildren: {
                $lt: 8,
            },
        }

        const ordering = {
            level: 1,
            totalChildren: 1,
        }

        const cursor = this._collection.find(query).sort(ordering)
        return this.toRawObservable(cursor).pipe(
            throwIfEmpty(() => {
                return {}
            }),
            take(1),
            map(data => {
                return this.toModel(data)
            }),
        )

    }

    public queryByDuration(start: Date, end: Date, query?: INodeQuery): Observable<INode> {
        const querySetting = {
            createdDate: {
                $gte: start.getTime(),
                $lte: end.getTime(),
            },
        }
        const nodeStatus: NodeStatus = _.get(query, 'nodeStatus')
        if (!_.isNil(nodeStatus)) {
            _.assign(querySetting, {
                'status.activate': nodeStatus,
            })
        }
        const paymentStatus: PaymentStatus = _.get(query, 'paymentStatus')
        if (!_.isNil(paymentStatus)) {
            _.assign(querySetting, {
                'status.payment': paymentStatus,
            })
        }

        const sortOption = {
            createdDate: -1,
        }

        const cursor = this._collection.find(querySetting).sort(sortOption)
        return this.toObservable(cursor)
    }

    public getByMultipleId(id: string[]): Observable<INode> {
        const cursor = this._collection.find({
            _id: {$in: id},
        })
        return this.toObservable(cursor)
    }

    public getNodeByPolicy(input: string): Observable<INode> {
        const query = {
            'policy.no': input,
        }
        return from(this._collection.findOne(query)).pipe(
            tap((doc: ISchema) => {
                if (_.isNil(doc)) {
                    throw new HttpException('Resource not found',
                        HttpStatus.NOT_FOUND,
                    )
                }
            }),
            map((doc: ISchema) => this._mapper.deserialize(doc)),
        )
    }
}

export class NetworkRepositoryMapping implements IRepositoryMapping<INode> {
    constructor(
        private readonly _cipher: ICipher,
    ) {
    }

    public deserialize(obj: ISchema): INode {
        if (_.isNil(obj)) {
            return null
        }
        const id = obj._id.toString()

        const ecid = this._cipher.decrypt(obj.ecid)
        const plate: ILicensePlate = {
            name: obj.plate.name,
            province: obj.plate.province,
        }

        const policy: IPolicy = {
            name: obj.policy.name,
            policyNumber: obj.policy.no,
            effectiveDate: new Date(obj.policy.effectiveDate),
            expiryDate: new Date(obj.policy.expiryDate),
        }

        const bankAccount: IBankAccount = {
            accountNumber: obj.bankAccount.account,
            bankName: obj.bankAccount.bank,
        }

        const level = obj.level

        const model = new NodeModel(id, ecid, plate, policy, bankAccount, level)

        model.setOriginalReference(obj.originalRef)

        _.assign(model, {
            _nodeStatus: obj.status.activate,
            _paymentStatus: obj.status.payment,
            _parents: obj.parents,
            _createdDate: new Date(obj.createdDate),
            _totalChildren: obj.totalChildren,
            _fullPath: obj.fullPath,
        })
        return model
    }

    public serialize(model: INode): ISchema {
        const result: ISchema = {
            _id: _.isNil(model.getId()) ? undefined : model.getId(),
            ecid: this._cipher.encrypt(model.getEcid()),
            plate: {
                name: model.getPlate().name,
                province: model.getPlate().province,
            },
            bankAccount: {
                bank: model.getBankAccount().bankName,
                account: model.getBankAccount().accountNumber,
            },
            status: {
                activate: model.getStatus(),
                payment: model.getPaymentStatus(),
            },
            policy: {
                name: model.getPolicy().name,
                no: model.getPolicy().policyNumber,
                effectiveDate: model.getPolicy().effectiveDate.getTime(),
                expiryDate: model.getPolicy().expiryDate.getTime(),
            },
            level: model.getLevel(),
            parents: model.getParents(),
            createdDate: model.getCreatedDate().getTime(),
            lastUpdate: Date.now(),
            totalChildren: model.getTotalChildren(),
            fullPath: model.getFamily(),
            originalRef: model.getOriginalReference(),

        }
        return result
    }
}
