import { ITransactionModel } from './interface'
import { Entity } from '../../common/entity'

export class TransactionModel extends Entity implements ITransactionModel {
    private _created
    private _updated
    private _status
    private _message

    constructor(
        create: number,
    ) {
        super()
        this._created = create
    }

    getCreateDate(): any {
        return this._created
    }

    getStatus(): any {
        return this._status
    }

    getUpdateDate(): any {
        return this._updated
    }

    setCreateDate(input: any): void {
        this._created = input
    }

    setStatus(input: string): void {
        this._status = input
    }

    setUpdateDate(input: any): void {
        this._updated = input
    }

    getMessage(): any {
        return this._message
    }

    setMessage(input: string): void {
        this._message = input
    }

}
