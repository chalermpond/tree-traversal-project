import {
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Inject,
    Param,
    Post,
    Req,
} from '@nestjs/common'
import * as _ from 'lodash'
import { ProviderName } from '../../provider'
import { IAuthService } from '../../service/auth/interface/service.interface'
import { IPolicyService } from '../../service/policy/interface'
import { IUserDto } from '../../service/user/interface'

const {
    AuthServiceProvider,
    PolicyServiceProvider,
} = ProviderName

@Controller('/policy')
export class PolicyController {
    constructor(
        @Inject(PolicyServiceProvider)
        private _policyService: IPolicyService,
        @Inject(AuthServiceProvider)
        private _auth: IAuthService,
    ) {
    }

    @Get('/:id')
    public retrievePolicyById(
        @Param('id') policyId: string,
        @Req() req: any,
    ): any {
        if (policyId === 'me') {
            const token = _.replace(
                _.get(req.headers, 'authorization', ''),
                /^Bearer\s/ig,
                '',
            )
            const decoded: IUserDto = this._auth.verifyToken(token)
            if (!decoded) {
                throw new HttpException(
                    'Cannot verify user',
                    HttpStatus.BAD_REQUEST,
                )
            }
            const plate = decoded.id.split('|')
            return this._policyService.getPersonalPolicy(plate[0], plate[1])
        }
        return this._policyService.getPolicyById(policyId)
    }

    @Post()
    public create(): any {
        return {status: 200}
    }
}
