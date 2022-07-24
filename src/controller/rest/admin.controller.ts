import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Inject,
    Post,
    Query,
    Req,
} from '@nestjs/common'
import { ProviderName } from '../../provider'
import { IAdminService } from '../../service/admin/interface'
import { Observable } from 'rxjs'
import { AdminValidator } from './validator/admin.validator'
import { IAuthService } from '../../service/auth/interface/service.interface'
import { mergeMap } from 'rxjs/operators'
import {
    get as _get,
    replace as _replace,
} from 'lodash'
import { RoleGuard } from '../../common/role-guard'

const {
    AdminServiceProvider,
    AdminAuthServiceProvider,
} = ProviderName

@Controller('/admin')
export class AdminController {
    constructor(
        @Inject(AdminServiceProvider)
        private readonly _adminService: IAdminService,
        @Inject(AdminAuthServiceProvider)
        private readonly _auth: IAuthService,
    ) {
    }

    // TODO use role guard
    @Post('/')
    public createNewAdmin(
        @Body() body: AdminValidator,
    ): Observable<any> {
        return this._adminService.create(body)
    }

    @Get('/login')
    public login(
        @Query('user') user: string,
        @Query('password') password: string,
    ) {
        return this._adminService.verifyPassword(user, password).pipe(
            mergeMap((mergedData: any) => {
                return this._auth.generateToken(mergedData)
            }),
        )
    }

    @Get('/token/refresh')
    public refreshToken(
        @Req() req: any,
    ) {
        const token = _get(req, 'headers.authorization', false)
        if (!token) {
            throw new HttpException(
                `Invalid Header`,
                HttpStatus.BAD_REQUEST,
            )
        }
        const result = this._auth.verifyToken(_replace(token, 'Bearer ', ''))
        if (!result) {
            throw new HttpException(
                `Invalid Authorization`,
                HttpStatus.BAD_REQUEST,
            )
        }
    }
}
