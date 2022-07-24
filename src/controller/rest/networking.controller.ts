import {
    Body,
    Controller,
    Get,
    Inject,
    Param,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common'
import * as _ from 'lodash'
import {
    forkJoin,
    Observable,
} from 'rxjs'
import {
    map,
    mergeMap,
} from 'rxjs/operators'
import { RoleGuard } from '../../common/role-guard'

import { ProviderName } from '../../provider'
import { IAuthService } from '../../service/auth/interface/service.interface'
import { INodeDto } from '../../service/networking/interface/dto.interface'
import { INetworkingService } from '../../service/networking/interface/service.interface'
import { IUserDto } from '../../service/user/interface'
import { NodeValidator } from './validator/node.validator'

const {
    AuthServiceProvider,
    NetworkingServiceProvider,
} = ProviderName

@Controller('/networking')
export class NetworkingController {
    constructor(
        @Inject(NetworkingServiceProvider)
        private readonly _networkingService: INetworkingService,
        @Inject(AuthServiceProvider)
        private readonly _auth: IAuthService,
    ) {
    }

    @UseGuards(RoleGuard)
    @Get('/me/profit')
    public getProfit(
        @Req() req: any,
    ) {
        const token = _.replace(
            _.get(req.headers, 'authorization', ''),
            /^Bearer\s/ig,
            '',
        )
        const decoded: IUserDto = this._auth.verifyToken(token)
        const user = decoded.id.split('|')
        return this._networkingService.getNodeByVehicleData(user[0], user[1]).pipe(
            map((dto: INodeDto) => dto.ref),
            mergeMap((ref: string) => forkJoin([
                    this._networkingService.getDirectProfit(ref),
                    this._networkingService.getReferenceProfit(ref),
                    this._networkingService.getYearlyProfit(ref, new Date().getFullYear()),
                ],
            )),
            map((resp: number[]) => ({
                    direct: resp[0],
                    reference: resp[1],
                    upToDate: resp[2],
                }),
            ),
        )
    }

    @UseGuards(RoleGuard)
    @Get('/me/member')
    public getTotalMember(
        @Req() req: any,
    ) {
        const token = _.replace(
            _.get(req.headers, 'authorization', ''),
            /^Bearer\s/ig,
            '',
        )
        const decoded: IUserDto = this._auth.verifyToken(token)
        const user = decoded.id.split('|')
        return this._networkingService.getNodeByVehicleData(user[0], user[1]).pipe(
            map((dto: INodeDto) => dto.ref),
            mergeMap(ref => forkJoin([
                    this._networkingService.getTotalChildren(ref),
                    this._networkingService.getNewRegistered(ref, new Date().getMonth()),
                ]),
            ),
            map((result: number[]) => ({
                    member: result[0],
                    monthly: result[1],
                }),
            ),
        )

    }

    @Get('/node/:id/children')
    @UseGuards(RoleGuard)
    public getChildrenByPolicy(
        @Param('id') id: string,
    ): Observable<any> {
        return this._networkingService.getChildrenByParentId(id)
    }

    @Get('/code/validate/:code')
    public validateCode(
        @Param('code') code: string,
    ) {
        return this._networkingService.validateReferenceCode(code)
    }

    @UseGuards(RoleGuard)
    @Post('/')
    public createNode(
        @Body() body: NodeValidator,
    ) {
        const reference = body.getReference()
        if (_.isNil(reference)) {
            return this._networkingService.createNewNode(body)
        }
        return this._networkingService.createNewNodeWithReference(body, reference)
    }

    @Post('/root')
    public addRootNode(
        @Body() body: NodeValidator,
    ) {
        return this._networkingService.addRootNode(body)
    }

}
