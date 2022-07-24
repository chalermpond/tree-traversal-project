import { IContactModel } from './model.interface'
import { IRepository } from '../../../common/interface/repository.interface'
import { Observable } from 'rxjs'

export interface IContactRepository extends IRepository<IContactModel> {
    list(page: number, limit: number): Observable<IContactModel>

    getById(id: string): Observable<IContactModel>

    save(model: IContactModel): Observable<{id: string}>

    update(model: IContactModel): Observable<any>

    delete(model: IContactModel): Observable<any>,
}
