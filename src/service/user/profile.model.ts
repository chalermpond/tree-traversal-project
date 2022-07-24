import * as _ from 'lodash'
import { Entity } from '../../common/entity'
import {
    IProfile,
    IUser,
} from './interface'

export class ProfileModel extends Entity implements IProfile {
    private readonly _createdDate: Date
    private _email: string
    private _name: string
    private _phone: string
    private _users: IUser[]

    constructor(ecid: string) {
        super()
        this.setId(ecid)
        this._createdDate = new Date()
        this._users = []
    }

    public getCreatedDate(): Date {
        return this._createdDate
    }

    public getEmail(): string {
        return this._email
    }

    public getName(): string {
        return this._name
    }

    public getPhone(): string {
        return this._phone
    }

    public getUsers(): IUser[] {
        return _.slice(this._users)
    }

    public addUser(user: IUser): void {
        const result = _.find(this._users, (u: IUser) => {
            return u.getUserName() === user.getUserName()
        })

        this.assertTrue(_.isNil(result))
        this._users.push(user)

    }

    public setEmail(email: string): void {
        this._email = email
    }

    public setName(name: string): void {
        this._name = name
    }

    public setPhone(phone: string): void {
        this._phone = phone
    }

}
