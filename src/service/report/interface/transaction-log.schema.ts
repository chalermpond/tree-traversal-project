export type Paid = 'Y' | 'N'
export interface ITransaction {
    Code: string
    BankAccount: string
    BankName: string
    Plate: string
    Benefit: number
    Type: string
    From: string
    Paid: Paid
    PaymentDate: string
}
