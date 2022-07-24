import { IRepository } from '../../../common/interface/repository.interface'
import { ITransactionLog } from '../../../common/interface/transaction-log.interface'
import { Observable } from 'rxjs'

export interface ITransactionLogRepository extends IRepository<ITransactionLog> {
    createLog(log: ITransactionLog)
    createLogs(logs: ITransactionLog[])
    queryLogsByCode(input: string, fullYear: number): Observable<any>
}
