import { IAdmin } from './model.interface'
import { IRepository } from '../../../common/interface/repository.interface'
import { Observable } from 'rxjs'

export interface IAdminRepositroy extends IRepository<IAdmin> {
    getByUsername(input: string): Observable<IAdmin>

    save(model: IAdmin): Observable<{id: string}>
}
