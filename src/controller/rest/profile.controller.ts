import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Inject,
    Put,
    Req,
    UseGuards,
} from '@nestjs/common'
import * as _ from 'lodash'
import { of } from 'rxjs'
import {
    catchError,
    map,
    mergeMap,
    reduce,
} from 'rxjs/operators'
import { RoleGuard } from '../../common/role-guard'
import { ProviderName } from '../../provider'
import { IAuthService } from '../../service/auth/interface/service.interface'
import { INetworkingService } from '../../service/networking/interface/service.interface'

import {
    IUserDto,
    IUserService,
} from '../../service/user/interface'
import { ProfileValidator } from './validator/user.validator'

const {
    AuthServiceProvider,
    UserServiceProvider,
    NetworkingServiceProvider,
} = ProviderName

@Controller('/profile')
export class ProfileController {
    constructor(
        @Inject(UserServiceProvider)
        private readonly _userService: IUserService,
        @Inject(AuthServiceProvider)
        private readonly _auth: IAuthService,
        @Inject(NetworkingServiceProvider)
        private readonly _networkingService: INetworkingService,
    ) {
    }

    //
    @UseGuards(RoleGuard)
    @Get('/me')
    public getOwnProfile(
        @Req() req: any,
    ) {

        const token = _.replace(
            _.get(req.headers, 'authorization', ''),
            /^Bearer\s/ig,
            '',
        )
        const decoded: IUserDto = this._auth.verifyToken(token)
        return this._userService.getProfile(decoded.cid).pipe(
            mergeMap(profileDto => {
                const user = decoded.id.split('|')
                return this._networkingService.getNodeByVehicleData(user[0], user[1]).pipe(
                    catchError((err: any) => {
                        return of({})
                    }),
                    map(rootNode => _.assign(
                        profileDto,
                        {
                            node: rootNode,
                        })),
                )
            }),
            mergeMap((dto: any) => {
                const ownRef = _.get(dto, 'node.ref', null)
                return this._networkingService.getNodesByCid(dto.cid).pipe(
                    reduce((total, current) => {
                        if (current.ref !== ownRef) {
                            total.push(current)
                        }
                        return total
                    }, []),
                    map(array => {
                        if (_.isEmpty(array)) {
                            return _.assign(dto, {nodes: []})
                        }
                        return _.assign(dto, {nodes: array})
                    }),
                )

            }),
            mergeMap((dto: any) => {
                if (_.isNil(_.get(dto, 'node.ref'))) {
                    return of(_.assign(dto, {children: []}))
                }
                return this._networkingService.getLeaves(dto.node.ref).pipe(
                    map(children => _.assign(dto, {children})),
                )
            }),
        )
    }

    @UseGuards(RoleGuard)
    @Put('/me')
    public updateOwnProfile(
        @Req() req: any,
        @Body() payload: ProfileValidator,
    ) {
        const token = _.replace(
            _.get(req.headers, 'authorization', ''),
            /^Bearer\s/ig,
            '',
        )
        const decoded: IUserDto = this._auth.verifyToken(token)
        if (!decoded) {
            throw new HttpException('Unable to update profile',
                HttpStatus.BAD_REQUEST,
            )
        }
        console.log(decoded)
        return this._userService.updateProfile(decoded.cid, payload)
    }
}
