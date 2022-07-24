import { Observable } from 'rxjs'

export interface IRepository<T> {
    list(page: number, limit: number): Observable<any>
    total(): Observable<number>
    toObservable(input: any): Observable<any>
}

export interface IRepositoryMapping<T> {
    serialize(model: T): any
    deserialize(obj: any): T
}
