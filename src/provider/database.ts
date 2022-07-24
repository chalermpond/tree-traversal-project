import { ProviderName } from './index'
import {
    Db,
    MongoClient,
} from 'mongodb'
import { IConfig } from '../common/interface/config.interface'
import { Provider as NestProviderInterface } from '@nestjs/common'

const {
    MongoDBConnectionProvider,
    EnvConfigProvider,
} = ProviderName
export const databaseProviders: NestProviderInterface[] = [
    {
        provide: MongoDBConnectionProvider,
        useFactory: async (config: IConfig): Promise<Db> => {
            if (config && config.mongodb) {
                const mongoConfig = config.mongodb
                const servers = process.env.MONGO_URL || mongoConfig.servers
                let auth = ''
                if (mongoConfig.username || mongoConfig.password) {
                    auth = `${mongoConfig.username}:${mongoConfig.password}@`
                }
                let url: string = 'mongodb://' + auth + servers
                    .split(',')
                    .map((server: string) => {
                        return server + ':' + mongoConfig.port
                    })
                    .toString() + '/' + mongoConfig.dbName

                if (mongoConfig.authSource) {
                    url += `?authSource=${mongoConfig.authSource}`
                }
                return await MongoClient.connect(url, {
                    useNewUrlParser: true,
                })
                    .then((client: MongoClient) => client.db(mongoConfig.dbName))
            }

            return Promise.reject('Cannot connect MongoDB')
        },
        inject: [EnvConfigProvider],
    },
]
