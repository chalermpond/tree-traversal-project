import {
    IsDefined,
    IsIn,
    IsNotEmpty,
    IsNumberString,
    Validate,
} from 'class-validator'
import { CustomDateString } from '../../../common/custom-validator'
import {
    ITransaction,
    Paid,
} from '../../../service/report/interface/transaction-log.schema'

// tslint:disable
export class TransactionValidator implements ITransaction {
    @IsDefined()
    @IsNotEmpty()
    public Code: string

    @IsDefined()
    @IsNotEmpty()
    public BankAccount: string

    @IsDefined()
    @IsNotEmpty()
    public BankName: string

    @IsDefined()
    @IsNotEmpty()
    public Plate: string

    @IsDefined()
    @IsNotEmpty()
    @IsNumberString()
    public Benefit: number

    @IsDefined()
    @IsIn(['New', 'Referred'])
    public Type: string

    @IsDefined()
    public From: string

    @IsDefined()
    @IsIn(['Y', 'N'])
    public Paid: Paid

    @IsDefined()
    @Validate(CustomDateString)
    public PaymentDate: string

}
