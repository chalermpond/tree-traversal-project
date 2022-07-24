import { IRepository } from '../../../common/interface/repository.interface'
import { ITransactionModel } from './model.interface'
import { Observable } from 'rxjs'

export interface ITransactionRepository extends IRepository<ITransactionModel> {
    save(model: ITransactionModel): Observable<{ id: string }>

    find(input: string): Observable<any>

    update(model: any): any

    retrieve(
        start: Date,
        end: Date,
        status: string,
    ): Observable<any>
}
