import { Observable } from 'rxjs'

export interface IAuthService {
    generateToken(payload: any): Observable<any>
    verifyToken(token: string): any
    refreshToken(token: any): Observable<any>
}
