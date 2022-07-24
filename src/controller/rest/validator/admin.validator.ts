import { IAdminValidator } from '../../../service/admin/interface'
import {
    IsDefined,
    IsEmail,
    IsString,
    MinLength,
} from 'class-validator'

export class AdminValidator implements IAdminValidator {
    @IsDefined()
    @IsString()
    private username: string

    @IsDefined()
    @IsString()
    @MinLength(10)
    private password: string

    @IsDefined()
    @IsEmail()
    private email: string

    public getEmail(): string {
        return this.email
    }

    public getPassword(): string {
        return this.password
    }

    public getUsername(): string {
        return this.username
    }

}
