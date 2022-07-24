import { ISoapModelValidator } from '../soap.model'
import { Observable } from 'rxjs'

export interface ISoapService {
    request(model: ISoapModelValidator, transaction: string): Observable<any>
}
