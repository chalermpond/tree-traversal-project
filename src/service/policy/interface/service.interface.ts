import { Observable } from 'rxjs'
import { IPolicyDto } from './dto.interface'

export interface IPolicyId {
    id: string
}

export class IPolicyValidator {
    name: string
    policy: string
    citizen: string
    license: string
    create: any
    address: string
    province: string
    brand: string
    model: string
    chassis: string
    doc: string
    start: string
    expire: string
    birth: string
    age: string
    career: string
    email: string
    mobile: string
    seat: string
    weight: string
    disp: string
    transaction: string
}

export interface IPolicyService {
    createNewPolicy(policy: IPolicyValidator): Observable<IPolicyId>

    retrievePolicy(license: string, citizen: string): Observable<any>

    getPolicyById(id: string): any

    getPolicyByCitizen(input: string): Observable<IPolicyDto[]>

    getPersonalPolicy(plate: string, province): Observable<IPolicyDto>
}
