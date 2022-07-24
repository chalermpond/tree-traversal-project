import {
    IBankData,
    INodeValidator,
    IPolicy,
} from '../../../service/networking/interface/service.interface'
import {
    IsDefined,
    IsNotEmpty,
    IsNumber,
    IsNumberString,
    IsOptional,
    IsString,
    Length,
    ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'

export class PolicyValidator implements IPolicy {
    @IsDefined()
    @IsString()
    @IsNotEmpty()
    public no: string

    @IsDefined()
    @IsNumber()
    public effectiveDate: number

    @IsDefined()
    @IsNumber()
    public expiryDate: number

}

export class BankDataValidator implements IBankData {
    @IsDefined()
    @IsString()
    @Length(10)
    public accountNumber: string

    @IsDefined()
    @IsNotEmpty()
    public name: string

}

export class NodeValidator implements INodeValidator {

    @IsDefined()
    @Length(13)
    @IsNumberString()
    private cid: string

    @IsDefined()
    @IsString()
    private plate: string

    @IsDefined()
    @IsString()
    private province: string

    @ValidateNested()
    @Type(() => PolicyValidator)
    private policy: PolicyValidator

    @ValidateNested()
    @Type(() => BankDataValidator)
    private bank: BankDataValidator

    @IsOptional()
    private reference: string

    public getBank(): IBankData {
        return this.bank
    }

    public getCid(): string {
        return this.cid
    }

    public getPlate(): string {
        return this.plate
    }

    public getPolicy(): IPolicy {
        return this.policy
    }

    public getProvince(): string {
        return this.province
    }

    public getReference(): string {
        return this.reference || null
    }

}
