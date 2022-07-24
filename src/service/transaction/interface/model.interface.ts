import { IEntity } from '../../../common/interface/entity.interface'

export interface ITransactionModel extends IEntity {
    getCreateDate(): any

    getUpdateDate(): any

    getStatus(): any

    getMessage(): any

    setCreateDate(input: any): void

    setUpdateDate(input: any): void

    setStatus(input: string): void

    setMessage(input: string): void
}
