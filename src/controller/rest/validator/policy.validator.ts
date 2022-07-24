import { IPolicyValidator } from '../../../service/policy/interface'
import {
    IsDefined,
    IsOptional,
} from 'class-validator'

export class PolicyValidator implements IPolicyValidator {
    @IsDefined()
    public address: string

    @IsDefined()
    public citizen: string

    @IsDefined()
    public create: any

    @IsDefined()
    public license: string

    @IsDefined()
    public name: any

    @IsDefined()
    public policy: string

    @IsDefined()
    public type: string

    @IsDefined()
    public province: string

    @IsOptional()
    brand: string

    @IsOptional()
    chassis: string

    @IsOptional()
    doc: string

    @IsOptional()
    expire: string

    @IsOptional()
    model: string

    @IsOptional()
    start: string

    @IsOptional()
    public age: string

    @IsOptional()
    public birth: string

    @IsOptional()
    public career: string

    @IsOptional()
    public disp: string

    @IsOptional()
    public email: string

    @IsOptional()
    public mobile: string

    @IsOptional()
    public seat: string

    @IsOptional()
    public weight: string

    @IsOptional()
    public transaction: string
}
