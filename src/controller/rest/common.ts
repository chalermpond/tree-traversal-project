import {
    Controller,
    Get,
    Inject,
} from '@nestjs/common'

import { ProviderName } from '../../provider'
import { ICommonService } from '../../service/common/interface/service.interface'

const {
    CommonServiceProvider,
} = ProviderName

@Controller('/')
export class CommonController {

    constructor(
        @Inject(CommonServiceProvider)
        private readonly _commonService: ICommonService,
    ) {
    }

    @Get('/')
    public healthCheck() {
        return {
            success: true,
        }
    }

    @Get('/provinces')
    public getProvinces() {
        return this._commonService.getProvinces()
    }
}
