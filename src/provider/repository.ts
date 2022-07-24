import { TransactionLogMongoRepository } from '../repository/transaction-log'
import { ProviderName } from './index'
import { Db } from 'mongodb'

import { Provider as NestProviderInterface } from '@nestjs/common/interfaces'
import { ContactMongoRepository } from '../repository/contact'
import { UserMongoRepository } from '../repository/user'
import { ProvinceMongoRepository } from '../repository/province'
import { IUserRepository } from '../service/user/interface/repository.interface'
import { ProfileMongoRepository } from '../repository/profile'
import { NetworkingRepository } from '../repository/networking'
import { PolicyMongoRepository } from '../repository/policy'
import { ICipher } from '../common/interface/cipher.interface'
import { TransactionMongoRepository } from '../repository/transaction'
import { AdminMongoRepository } from '../repository/admin'

const {
    TransactionLogRepositoryProvider,
    ProvinceRepositoryProvider,
    ContactRepositoryProvider,
    MongoDBConnectionProvider,
    UserRepositoryProvider,
    NetworkingRepositoryProvider,
    ProfileRepositoryProvider,
    PolicyRepositoryProvider,
    CipherServiceProvider,
    TransactionRepositoryProvider,
    AdminRepositoryProvider,
} = ProviderName

export const repositoryProviders: NestProviderInterface[] = [
    {
        provide: ContactRepositoryProvider,
        useFactory: (db: Db) => {
            return new ContactMongoRepository(db)
        },
        inject: [MongoDBConnectionProvider],
    },
    {
        provide: UserRepositoryProvider,
        useFactory: (
            db: Db,
            cipher: ICipher) => new UserMongoRepository(db, cipher),
        inject: [
            MongoDBConnectionProvider,
            CipherServiceProvider,
        ],
    },
    {
        provide: ProvinceRepositoryProvider,
        useFactory: (db: Db) => new ProvinceMongoRepository(db),
        inject: [MongoDBConnectionProvider],
    },
    {
        provide: NetworkingRepositoryProvider,
        useFactory: (db: Db, cipher: ICipher) => new NetworkingRepository(db, cipher),
        inject: [
            MongoDBConnectionProvider,
            CipherServiceProvider,
        ],
    },
    {
        provide: ProfileRepositoryProvider,
        useFactory: (
            db: Db,
            repo: IUserRepository,
            cipher: ICipher,
        ) => new ProfileMongoRepository(db, repo, cipher),
        inject: [
            MongoDBConnectionProvider,
            UserRepositoryProvider,
            CipherServiceProvider,
        ],
    },
    {
        provide: PolicyRepositoryProvider,
        useFactory: (
            db: Db,
            cipher: ICipher,
        ) => {
            return new PolicyMongoRepository(db, cipher)
        },
        inject: [
            MongoDBConnectionProvider,
            CipherServiceProvider,
        ],
    },
    {
        provide: TransactionRepositoryProvider,
        useFactory:
            (db: Db) => {
                return new TransactionMongoRepository(db)
            },
        inject:
            [MongoDBConnectionProvider],
    },
    {
        provide: AdminRepositoryProvider,
        useFactory: (db: Db) => {
            return new AdminMongoRepository(db)
        },
        inject: [MongoDBConnectionProvider],
    },
    {
        provide: TransactionLogRepositoryProvider,
        useFactory: (db: Db) => {
            return new TransactionLogMongoRepository(db)
        },
        inject: [MongoDBConnectionProvider],

    },
]
