import {
    IProfileValidator,
    IUserValidator,
} from '../../../service/user/interface'
import {
    IsBoolean,
    IsEmail,
    IsNumberString,
    IsOptional,
    IsString,
    MinLength,
} from 'class-validator'

export class UserValidator implements IUserValidator {
    @IsOptional()
    private id: string

    @IsOptional()
    @IsString()
    private name: string

    @IsOptional()
    @IsEmail()
    private email: string

    @IsOptional()
    @IsString()
    @MinLength(10)
    private password: string

    @IsOptional()
    @IsString()
    private phone: string

    @IsOptional()
    @IsBoolean()
    private suspended: boolean

    @IsOptional()
    @IsString()
    private province: string

    @IsOptional()
    @IsString()
    private citizen: string

    public getId(): string {
        return this.id
    }

    public getEmail(): string {
        return this.email
    }

    public getName(): string {
        return this.name
    }

    public getPassword(): string {
        return this.password
    }

    public getPhone(): string {
        return this.phone
    }

    public getSuspended(): boolean {
        return !!this.suspended
    }

    public getProvince(): string {
        return this.province
    }

    public getCitizen(): string {
        return this.citizen
    }
}

export class ProfileValidator implements IProfileValidator {

    @IsOptional()
    @IsEmail()
    private email: string

    @IsOptional()
    @IsString()
    private fullName: string

    @IsOptional()
    @IsNumberString()
    private phone: string

    public getEmail(): string {
        return this.email || null
    }

    public getFullName(): string {
        return this.fullName || null
    }

    public getPhone(): string {
        return this.phone || null
    }

}
