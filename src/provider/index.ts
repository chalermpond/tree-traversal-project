export enum ProviderName {
    // Peripheral Providers
    EnvConfigProvider = 'environment-config',
    MongoDBConnectionProvider = 'mongodb-connection',
    CipherServiceProvider = 'cipher-service-provider',

    // Repository Providers
    ProvinceRepositoryProvider = 'province-repository-provider',
    ContactRepositoryProvider = 'contact-repository-provider',
    UserRepositoryProvider = 'user-repository-provider',
    ProfileRepositoryProvider = 'profile-repository-provider',
    NetworkingRepositoryProvider = 'networking-repository-provider',
    PolicyRepositoryProvider = 'policy-repository-provider',
    TransactionRepositoryProvider = 'transaction-repository-provider',
    AdminRepositoryProvider = 'admin-repository-provider',
    TransactionLogRepositoryProvider = 'transaction-log-repository-provider',

    // Service Providers
    CommonServiceProvider = 'common-service-provider',
    ContactServiceProvider = 'contact-service-provider',
    AuthServiceProvider = 'auth-service-provider',
    UserServiceProvider = 'user-service-provider',
    PolicyServiceProvider = 'policy-service-provider',
    NetworkingServiceProvider = 'networking-service-provider',
    TransactionServiceProvider = 'transaction-service-provider',
    SoapServiceProvider = 'soap-service-provider',
    ReportServiceProvider = 'report-service-provider',
    AdminServiceProvider = 'admin-service-provider',
    AdminAuthServiceProvider = 'admin-auth-service-provider',

    // Adapter Providers
    ThaiPaiboonAdapterProvider = 'thaipaiboon-adapter-provider',
}

export * from './env-config'
export * from './database'
export * from './repository'
export * from './service'
export * from './adapter'
