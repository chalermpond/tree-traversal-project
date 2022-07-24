import { AuthService } from './auth.service'
import {
    Inject,
    Injectable,
} from '@nestjs/common'
import { IConfig } from '../../common/interface/config.interface'
import { readFileSync } from 'fs'
import { ProviderName } from '../../provider'
import { IAuthService } from './interface/service.interface'

const {
    EnvConfigProvider,
} = ProviderName

@Injectable()
export class AdminAuthService extends AuthService implements IAuthService {
    constructor(
        @Inject(EnvConfigProvider) _config: IConfig,
    ) {
        super(_config)
        this._ignoreExpiration = !!_config.authAdmin.ignoreExpiration
        this._publicKey = readFileSync(_config.authAdmin.public)
        this._privateKey = readFileSync(_config.authAdmin.private)
    }
}
