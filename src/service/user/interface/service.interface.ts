import { Observable } from 'rxjs'
import { IProfileDto } from './dto.interface'

export interface IUserService {
    create(input: any): Observable<any>

    update(id: string, input: any): Observable<any>

    list(page: number, limit: number): Observable<any>

    getUser(id: string): Observable<any>

    suspend(id: string): Observable<any>

    reactivate(id: string): Observable<any>

    verifyPassword(username: string, password: string): Observable<any>

    getProfile(id: string): Observable<IProfileDto>

    updateProfile(cid: string, payload: IProfileValidator): Observable<IProfileDto>
}

export interface IUserValidator {
    getId(): string

    getName(): string

    getEmail(): string

    getPhone(): string

    getPassword(): string

    getSuspended(): boolean

    getProvince(): string

    getCitizen(): string
}

export interface IProfileValidator {
    getFullName(): string

    getPhone(): string

    getEmail(): string
}
