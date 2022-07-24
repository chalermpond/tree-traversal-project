import cryptoRandomString = require('crypto-random-string')
import { pbkdf2Sync } from 'crypto'
import * as _ from 'lodash'
import { Entity } from '../../common/entity'

import {
    IUser,
    SystemRole,
} from './interface'

export class UserModel extends Entity implements IUser {
    private _name: string
    private _user: string
    private _salt: string
    private _email: string
    private _role: SystemRole
    private _suspended: boolean
    private _password: string
    private _phone: string
    private _province: string
    private _citizen: string

    constructor() {
        super()
        this._generateNewSalt()
    }

    private _generateNewSalt() {
        this._salt = cryptoRandomString(12)
    }

    public getName(): string {
        return this._name
    }

    public getUserName(): string {
        return this._user
    }

    public getEmail(): string {
        return this._email
    }

    public setName(name: string) {
        this._name = name
    }

    public setEmail(email: string) {
        this._email = email
    }

    public setUserName(user: string) {
        this._user = user
    }

    public setRole(role: SystemRole) {
        this.assertTrue(
            this._role !== SystemRole.Administrator,
            `Cannot revoke or update admin role`,
        )
        this.assertTrue(
            role !== SystemRole.Administrator,
            `Cannot leverage into admin role`,
        )

        this._role = role
    }

    public setSuspend(flag: boolean): void {
        this.assertTrue(
            this._role !== SystemRole.Administrator,
            `Cannot suspend admin account`,
        )
        this._suspended = flag
    }

    public challengePassword(password: string): boolean {
        const buffer = pbkdf2Sync(
            password,
            this._salt,
            12000,
            64,
            'sha256')
        return buffer.toString('hex') === this._password

    }

    public setPassword(password: string): string {
        this._generateNewSalt()
        const buffer = pbkdf2Sync(
            password,
            this._salt,
            12000,
            64,
            'sha256')
        this._password = buffer.toString('hex')
        return this._password
    }

    public isSuspended(): boolean {
        return this._suspended
    }

    public getPhone(): string {
        return this._phone
    }

    public setPhone(number: string): void {
        this._phone = _.toString(number)
    }

    public getRole(): SystemRole {
        return this._role
    }

    getProvince(): string {
        return this._province;
    }

    setProvince(province: string): void {
        this._province = province
    }

    getCitizen(): string {
        return this._citizen;
    }

    setCitizen(citizen: string): void {
        this._citizen = citizen
    }
}
