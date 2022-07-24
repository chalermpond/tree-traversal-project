import { IRepository } from '../../../common/interface/repository.interface'
import { IPolicyModel } from './model.interface'
import { Observable } from 'rxjs'

export interface IPolicyRepository extends IRepository<IPolicyModel> {
    save(model: IPolicyModel): Observable<{ id: string }>

    retrieve(license: string, citizen: string): any

    retrieveByLicense(license: string): any

    getById(policy: string): Observable<any>

    getByCitizen(input: string): Observable<IPolicyModel>
}
