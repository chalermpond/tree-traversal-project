import { IEntity } from '../../../common/interface/entity.interface'
import { SystemRole } from '../../user/interface'

export interface IAdmin extends IEntity {
    getUsername(): string

    getPassword(): string

    getEmail(): string

    isSuspended(): boolean

    setUsername(input: string): void

    setPassword(input: string): void

    setEmail(input: string): void

    setSuspend(flag: boolean): void

    challengePassword(password: string): boolean

    setRole(role: SystemRole): void

}
