import { Observable } from 'rxjs'
import { ITransaction } from './transaction-log.schema'

export enum PaymentStatus {
    Paid = 'paid',
    Unpaid = 'unpaid',
}

export interface IReportService {
    getMonthlyTransactionReport(start: Date, end: Date): Observable<string>

    getSummaryTransactionReport(start: Date, end: Date): Observable<string>

    importPaymentStatus(records: ITransaction[], operator?: string): Observable<any>

    getYearlyProfitTransaction(code: string, fullYear: number): Observable<any>
}
