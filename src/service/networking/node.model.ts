import * as _ from 'lodash'
import { Entity } from '../../common/entity'
import {
    IBankAccount,
    ILicensePlate,
    INode,
    IPolicy,
    NodeStatus,
    PaymentStatus,
} from './interface/model.interface'

export class NodeModel extends Entity implements INode {

    private _plate: ILicensePlate

    private _bankAccount: IBankAccount
    private _paymentStatus: PaymentStatus
    private _policy: IPolicy
    private _nodeStatus: NodeStatus
    private _parents: string[]
    private readonly _createdDate: Date
    private readonly _ecid: string
    private _level: number
    private _totalChildren: number
    private _fullPath: string[]
    private _originalReference: string

    constructor(refCode: string, ecid: string, plate: ILicensePlate, policy: IPolicy, bankAccount: IBankAccount, level: number) {
        super()
        this.setId(refCode)

        this.assertFalse(_.isNil(ecid))
        this.assertFalse(_.isNil(plate.name))
        this.assertFalse(_.isNil(plate.province))
        this.assertFalse(_.isNil(policy))
        this.assertFalse(_.isNil(bankAccount))

        this._ecid = ecid
        this._plate = plate
        this._level = level

        this._bankAccount = bankAccount
        this._createdDate = new Date()
        this._paymentStatus = PaymentStatus.Unpaid
        this._nodeStatus = NodeStatus.Active
        this._parents = []
        this._policy = policy
        this._totalChildren = 0
        this._fullPath = []
        this._originalReference = ''
    }

    public getEcid(): string {
        return this._ecid
    }

    public getBankAccount(): IBankAccount {
        return _.cloneDeep(this._bankAccount)
    }

    public getCreatedDate(): Date {
        return this._createdDate
    }

    public getPlate(): ILicensePlate {
        return _.cloneDeep(this._plate)
    }

    public getPaymentStatus(): PaymentStatus {
        return this._paymentStatus
    }

    public getPolicy(): IPolicy {
        return _.cloneDeep(this._policy)
    }

    public getStatus(): NodeStatus {
        return this._nodeStatus
    }

    public setBankAccount(account: IBankAccount): void {
        this._bankAccount = account
    }

    public setPlate(plate: ILicensePlate): void {
        this._plate = plate
    }

    public setPaymentStatus(status: PaymentStatus): void {
        this._paymentStatus = status
    }

    public setPolicy(policy: IPolicy): void {
        this._policy = policy
    }

    public setStatus(status: NodeStatus) {
        this._nodeStatus = status
    }

    public getParents(): string[] {
        return _.slice(this._parents)
    }

    public setParents(parent: INode): void {
        const parentId = parent.getId()

        this.assertEqual(_.sortedIndexOf(this._fullPath, parentId), -1)

        let ancestors = parent.getParents()
        ancestors.push(parentId)

        if (ancestors.length > 5) {
            ancestors = _.takeRight(ancestors, 5)
        }
        this._parents = ancestors
        const path = parent.getFamily().concat(parentId)
        this._fullPath = _.sortBy(path)
    }

    public getLevel(): number {
        return this._level
    }

    public setLevel(level: number): void {
        this._level = level
    }

    public getTotalChildren(): number {
        return this._totalChildren
    }

    public increaseChildrenCount(): number {
        this.assertTrue(this._totalChildren < 8)
        return ++this._totalChildren
    }

    public getFamily(): string[] {
        return _.slice(this._fullPath)
    }

    public getOriginalReference(): string {
        return this._originalReference
    }

    public setOriginalReference(refId: string): void {
        this._originalReference = refId
    }

}
