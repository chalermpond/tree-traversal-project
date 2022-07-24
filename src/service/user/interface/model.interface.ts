import { IEntity } from '../../../common/interface/entity.interface'

export enum SystemRole {
    Administrator = 'administrator',
    Agent = 'agent',
}

export interface IUser extends IEntity {
    getName(): string

    getUserName(): string

    getEmail(): string

    setName(name: string): void

    setEmail(email: string): void

    setUserName(user: string): void

    setRole(role: SystemRole): void

    getRole(): SystemRole

    setSuspend(flag: boolean): void

    isSuspended(): boolean

    setPassword(password: string): string

    setPhone(number: string): void

    getPhone(): string

    challengePassword(password: string): boolean

    getProvince(): string

    setProvince(province: string): void

    getCitizen(): string

    setCitizen(citizen: string): void
}

export interface IProfile extends IEntity {

    getName(): string

    getEmail(): string

    getPhone(): string

    getUsers(): IUser[]

    getCreatedDate(): Date

    setName(name: string): void

    setEmail(email: string): void

    setPhone(phone: string): void

    addUser(user: IUser): void

}
