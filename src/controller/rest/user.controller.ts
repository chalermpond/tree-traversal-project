import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Inject,
    Param,
    Patch,
    Post,
    Put,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common'
import * as _ from 'lodash'
import {
    get as _get,
    replace as _replace,
} from 'lodash'
import { mergeMap } from 'rxjs/operators'
import { StringToNumberPipeTransform } from '../../common/pipe-transform'
import { RoleGuard } from '../../common/role-guard'
import { ProviderName } from '../../provider'
import { IAuthService } from '../../service/auth/interface/service.interface'
import { IPolicyService } from '../../service/policy/interface'
import {
    IUserDto,
    IUserService,
} from '../../service/user/interface'
import { UserValidator } from './validator/user.validator'

const {
    AuthServiceProvider,
    PolicyRepositoryProvider,
    UserServiceProvider,
} = ProviderName

@Controller('/user')
export class UserController {
    constructor(
        @Inject(UserServiceProvider)
        private readonly _userService: IUserService,
        @Inject(AuthServiceProvider)
        private readonly _auth: IAuthService,
        @Inject(PolicyRepositoryProvider)
        private readonly _policyService: IPolicyService,
    ) {
    }

    //
    @UseGuards(RoleGuard)
    @Get('/')
    public listAllUsers(
        @Query('page', StringToNumberPipeTransform) page: number,
        @Query('limit', StringToNumberPipeTransform) limit: number,
    ) {
        // return this._userService.list(page, limit)
    }

    @Get('/login')
    public login(
        @Query('user') user: string,
        @Query('password') password: string,
    ) {
        return this._userService.verifyPassword(user, password).pipe(
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
        return this._userService.getUser(result.id).pipe(
            mergeMap((userDto: IUserDto) => {
                return this._auth.generateToken(userDto)
            }),
        )
    }

    @UseGuards(RoleGuard)
    @Get('/:id')
    public getUserById(
        @Param('id') id: string,
    ) {
        return this._userService.getUser(id)
    }

    // @UseGuards(RoleGuard)
    @Post('/')
    public createNewUser(
        @Body() body: UserValidator,
    ) {
        // TODO check policy service first
        return this._userService.create(body)
    }

    @UseGuards(RoleGuard)
    @Patch('/:id/suspend')
    public suspendUser(
        @Param('id') id: string,
    ) {
        return this._userService.suspend(id)
    }

    @UseGuards(RoleGuard)
    @Patch('/:id/reactivate')
    public reactivateUser(
        @Param('id') id: string,
    ) {
        return this._userService.reactivate(id)
    }

    @UseGuards(RoleGuard)
    @Put('/:id')
    public updateUser(
        @Param('id') id: string,
        @Body() payload: UserValidator,
        @Req() req,
    ) {
        const token = _.replace(
            _.get(req.headers, 'authorization', ''),
            /^Bearer\s/ig,
            '',
        )
        if (id === 'me') {
            const decoded: IUserDto = this._auth.verifyToken(token)
            if (!decoded) {
                throw new HttpException(
                    'Cannot update user',
                    HttpStatus.BAD_REQUEST,
                )
            }
            id = decoded.id
        }

        return this._userService.update(id, payload)
    }

}
