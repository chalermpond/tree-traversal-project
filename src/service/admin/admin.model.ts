import { Entity } from '../../common/entity'
import { IAdmin } from './interface'
import { pbkdf2Sync } from 'crypto'
import { SystemRole } from '../user/interface'
import * as cryptoRandomString from 'crypto-random-string'

export class AdminModel extends Entity implements IAdmin {
    private _username: string
    private _password: string
    private _email: string
    private _salt: string
    private _role: SystemRole
    private _suspended: boolean

    constructor() {
        super()
        this._generateNewSalt()
    }

    private _generateNewSalt() {
        this._salt = cryptoRandomString(12)
    }

    public getEmail(): string {
        return this._email
    }

    public getPassword(): string {
        return this._password
    }

    public getUsername(): string {
        return this._username
    }

    public setEmail(input: string): void {
        this._email = input
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

    public setUsername(input: string): void {
        this._username = input
    }

    public challengePassword(input: string): boolean {
        const buffer = pbkdf2Sync(
            input,
            this._salt,
            12000,
            64,
            'sha256')
        return buffer.toString('hex') === this._password
    }

    public isSuspended(): boolean {
        return false
    }

    public setSuspend(flag: boolean): void {
        this.assertTrue(
            this._role !== SystemRole.Administrator,
            `Cannot suspend admin account`,
        )
        this._suspended = flag
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

}
