import { Provider as NestProviderInterface } from '@nestjs/common'
import { Cipher } from '../common/cipher'
import { IConfig } from '../common/interface/config.interface'
import { AdminService } from '../service/admin/admin.service'
import { IAdminRepositroy } from '../service/admin/interface'
import { AdminAuthService } from '../service/auth/admin-auth.service'
import { AuthService } from '../service/auth/auth.service'
import { CommonService } from '../service/common/common.service'
import { IProvinceRepository } from '../service/common/interface/repository.interface'
import { ContactService } from '../service/contact/contact.service'
import { IContactRepository } from '../service/contact/interface/repository.interface'
import { INetworkingRepository } from '../service/networking/interface/repository.interface'
import { NetworkingService } from '../service/networking/networking.service'
import { IPolicyRepository } from '../service/policy/interface/repository.interface'
import { PolicyService } from '../service/policy/policy.service'
import { ITransactionLogRepository } from '../service/report/interface/repository.interface'
import { ReportService } from '../service/report/report.service'
import { SoapService } from '../service/soap/soap.service'
import { ITransactionRepository } from '../service/transaction/interface/repository.interface'
import { TransactionService } from '../service/transaction/transaction.service'
import {
    IProfileRepository,
    IUserRepository,
} from '../service/user/interface/repository.interface'
import { UserService } from '../service/user/user.service'
import { ProviderName } from './index'

const {
    AuthServiceProvider,
    CommonServiceProvider,
    ProvinceRepositoryProvider,
    ContactServiceProvider,
    ContactRepositoryProvider,
    EnvConfigProvider,
    UserServiceProvider,
    UserRepositoryProvider,
    PolicyServiceProvider,
    ProfileRepositoryProvider,
    NetworkingServiceProvider,
    NetworkingRepositoryProvider,
    PolicyRepositoryProvider,
    CipherServiceProvider,
    TransactionServiceProvider,
    TransactionRepositoryProvider,
    SoapServiceProvider,
    ReportServiceProvider,
    AdminServiceProvider,
    AdminRepositoryProvider,
    AdminAuthServiceProvider,
    TransactionLogRepositoryProvider,
} = ProviderName

export const contactServiceProvider: NestProviderInterface = {
    provide: ContactServiceProvider,
    inject: [
        ContactRepositoryProvider,
    ],
    useFactory: (
        contactRepo: IContactRepository,
    ) => {
        return new ContactService(
            contactRepo,
        )
    },
}

export const authServiceProvider: NestProviderInterface = {
    provide: AuthServiceProvider,
    inject: [
        EnvConfigProvider,
    ],
    useFactory: (conf: IConfig) => new AuthService(conf),
}

export const userServiceProvider: NestProviderInterface = {
    provide: UserServiceProvider,
    inject: [
        UserRepositoryProvider,
        ProfileRepositoryProvider,
        PolicyRepositoryProvider,
    ],
    useFactory: (
        userRepository: IUserRepository,
        profileRepository: IProfileRepository,
        policyRepository: IPolicyRepository,
    ) => new UserService(userRepository, profileRepository, policyRepository),
}

export const commonServiceProvider: NestProviderInterface = {
    provide: CommonServiceProvider,
    inject: [
        ProvinceRepositoryProvider,
    ],
    useFactory: (repository: IProvinceRepository) => new CommonService(repository),
}

export const networkingServiceProvider: NestProviderInterface = {
    provide: NetworkingServiceProvider,
    inject: [
        NetworkingRepositoryProvider,
        EnvConfigProvider,
        PolicyRepositoryProvider,
    ],
    useFactory: (
        repository: INetworkingRepository,
        config: IConfig,
        policy: IPolicyRepository,
    ) => new NetworkingService(repository, config, policy),
}

export const policyServiceProvider: NestProviderInterface = {
    provide: PolicyServiceProvider,
    inject: [
        PolicyRepositoryProvider,
        NetworkingRepositoryProvider,
    ],
    useFactory: (
        repository: IPolicyRepository,
        networking: INetworkingRepository,
    ) => new PolicyService(repository, networking),
}

export const cipherServiceProvider: NestProviderInterface = {
    provide: CipherServiceProvider,
    inject: [EnvConfigProvider],
    useFactory: (config: IConfig) => new Cipher(config),
}

export const transactionServiceProvider: NestProviderInterface = {
    provide: TransactionServiceProvider,
    inject: [
        TransactionRepositoryProvider,
    ],
    useFactory: (repository: ITransactionRepository) => new TransactionService(repository),
}

export const soapServiceProvider: NestProviderInterface = {
    provide: SoapServiceProvider,
    inject: [
        PolicyRepositoryProvider,
    ],
    useFactory: (repository: IPolicyRepository) => new SoapService(repository),
}

export const reportServiceProvider: NestProviderInterface = {
    provide: ReportServiceProvider,
    inject: [
        NetworkingRepositoryProvider,
        TransactionLogRepositoryProvider,
        EnvConfigProvider,
    ],
    useFactory: (
        repository: INetworkingRepository,
        logRepository: ITransactionLogRepository,
        config: IConfig,
    ) => new ReportService(repository, logRepository, config),
}

export const adminServiceProvicer: NestProviderInterface = {
    provide: AdminServiceProvider,
    inject: [
        AdminRepositoryProvider,
    ],
    useFactory: (
        repository: IAdminRepositroy,
    ) => new AdminService(repository),
}

export const adminAuthServiceProvider: NestProviderInterface = {
    provide: AdminAuthServiceProvider,
    inject: [
        EnvConfigProvider,
    ],
    useFactory: (conf: IConfig) => new AdminAuthService(conf),
}
