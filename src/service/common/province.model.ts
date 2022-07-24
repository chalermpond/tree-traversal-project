import { Entity } from '../../common/entity'
import { IProvince } from './interface/common.interface'

export class ProvinceModel extends Entity implements IProvince {
    private _code: string
    private _name: string

    constructor() {
        super()
    }

    public getCode(): string {
        return this._code
    }

    public getName(): string {
        return this._name
    }

    public setCode(code: string): void {
        this._code = code
    }

    public setName(name: string): void {
        this._name = name
    }
}
