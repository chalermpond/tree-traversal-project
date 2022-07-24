import { Provider as NestProviderInterface } from '@nestjs/common'

import { ProviderName } from '.'
import * as Config from 'config'
import { IConfig } from '../common/interface/config.interface'

const {
    EnvConfigProvider,
} = ProviderName
export const environmentConfig: NestProviderInterface = {
    provide: EnvConfigProvider,
    useFactory: (): IConfig => Config.util.toObject(),
}
