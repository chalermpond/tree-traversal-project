import { Observable } from 'rxjs'
import { IProvince } from './common.interface'

export interface IProvinceRepository {
    getProvinces(): Observable<IProvince>
}
