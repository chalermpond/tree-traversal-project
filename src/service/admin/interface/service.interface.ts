import { Observable } from 'rxjs'

export interface IAdminService {
    create(input: any): Observable<any>

    verifyPassword(username: string, password: string): Observable<any>
}

export interface IAdminValidator {
    getUsername(): string

    getPassword(): string

    getEmail(): string
}
