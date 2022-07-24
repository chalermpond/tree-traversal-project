import {
    IsDefined,
    IsEmail,
    IsOptional,
    IsString,
    MinLength,
} from 'class-validator'
import { IContactValidator } from '../../../service/contact/interface/service.interface'

export class ContactValidator implements IContactValidator {
    @IsOptional()
    public address: string

    @IsOptional()
    public company: string

    @IsOptional()
    @IsEmail()
    public email: string

    @IsOptional()
    public facebook: string

    @IsDefined()
    @IsString()
    @MinLength(6)
    public fullName: string

    @IsOptional()
    public line: string

    @IsOptional()
    public phone: string

    @IsOptional()
    @IsString({each: true})
    public tags: string[]

    @IsOptional()
    @IsString()
    public title: string

    @IsOptional()
    @IsString()
    public twitter: string

    @IsOptional()
    @IsString()
    public workPhone: string

}
