import { Observable } from 'rxjs'
import { IPolicyAdapterSchema } from './schema.interface'

export interface IPolicyAdapter {
    getByTransactionId(transaction: string): Observable<{ schema: IPolicyAdapterSchema, resp: string }>

    getByPolicyNumber(policyNo: string): Observable<{ schema: IPolicyAdapterSchema, resp: string }>
}
