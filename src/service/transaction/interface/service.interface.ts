import { Observable } from 'rxjs'

export interface ITransactionId {
    id: string
}

export class ITransactionValidator {
    created: any
    updated: any
    status: string
    message: string
}

export interface ITransactionService {
    createReferral(): Observable<ITransactionId>

    updateSuccess(id: string, message: string): Observable<any>

    updateFail(id: string, message: string): Observable<any>

    queryTransaction(start: Date, end: Date, status: string): Observable<any>
}
