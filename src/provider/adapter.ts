import { Provider as NestProviderInterface } from '@nestjs/common'
import { ThaiPaiboonPolicyAdapter } from '../adapter/tpb'
import { ProviderName } from './index'
const {
    EnvConfigProvider,
    ThaiPaiboonAdapterProvider,
} = ProviderName

export const adapterProviders: NestProviderInterface[] = [
    {
        provide: ThaiPaiboonAdapterProvider,
        inject: [
            EnvConfigProvider,
        ],
        useFactory: (config) => new ThaiPaiboonPolicyAdapter(config),
    },
]
