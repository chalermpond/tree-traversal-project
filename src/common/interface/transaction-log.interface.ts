export enum PaymentType {
    NEW = 'new',
    REFER = 'refer',
}

export enum PaymentStatus {
    PAID = 'paid',
    UNPAID = 'unpaid',
}

export interface ITransactionLog {
    operator: string
    code: string
    bankAccount: string
    bankName: string
    plate: string
    benefit: number
    paymentType: PaymentType
    referenceCode: string
    paymentStatus: PaymentStatus
    paymentDate: Date
}
