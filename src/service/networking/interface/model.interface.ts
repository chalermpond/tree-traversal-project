import { IEntity } from '../../../common/interface/entity.interface'

export enum NodeStatus {
    Active = 'active',
    Suspended = 'suspended',
}

export enum PaymentStatus {
    Paid = 'paid',
    Unpaid = 'unpaid',
}

export interface INode extends IEntity {

    setOriginalReference(refId: string): void

    getOriginalReference(): string

    setPlate(plate: ILicensePlate): void

    getPlate(): ILicensePlate

    setBankAccount(account: IBankAccount): void

    getBankAccount(): IBankAccount

    getPolicy(): IPolicy

    setPolicy(policy: IPolicy): void

    getStatus(): NodeStatus

    setStatus(status: NodeStatus)

    getCreatedDate(): Date

    getParents(): string[]

    getPaymentStatus(): PaymentStatus

    setPaymentStatus(status: PaymentStatus): void

    setParents(parent: INode): void

    getEcid(): string

    getLevel(): number

    setLevel(level: number): void

    getTotalChildren(): number

    increaseChildrenCount(): number

    getFamily(): string[]
}

export interface ILicensePlate {
    name: string
    province: string
}

export interface IBankAccount {
    accountNumber: string
    bankName: string
}

export interface IPolicy {
    policyNumber: string
    name: string
    effectiveDate: Date
    expiryDate: Date
}
