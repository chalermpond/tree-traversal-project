import {
    Inject,
    Module,
    OnModuleInit,
} from '@nestjs/common'
import { AdminController } from './controller/rest/admin.controller'
import { CommonController } from './controller/rest/common'
import { ContactController } from './controller/rest/contact.controller'
import { LandingController } from './controller/rest/landing.controller'
import { NetworkingController } from './controller/rest/networking.controller'
import { PolicyController } from './controller/rest/policy.controller'
import { ProfileController } from './controller/rest/profile.controller'
import { ReportController } from './controller/rest/report.controller'
import { UserController } from './controller/rest/user.controller'
import { migrationTasks } from './migration'
import { MongoMigration } from './migration/db'
import { IMigrationTask } from './migration/interface/migration.interface'
import { ProvinceMigration } from './migration/province'

import {
    adapterProviders,
    adminAuthServiceProvider,
    adminServiceProvicer,
    authServiceProvider,
    cipherServiceProvider,
    commonServiceProvider,
    contactServiceProvider,
    databaseProviders,
    environmentConfig,
    networkingServiceProvider,
    policyServiceProvider,
    reportServiceProvider,
    repositoryProviders,
    soapServiceProvider,
    transactionServiceProvider,
    userServiceProvider,
} from './provider'

@Module({
    controllers: [
        ContactController,
        UserController,
        CommonController,
        ProfileController,
        NetworkingController,
        PolicyController,
        LandingController,
        ReportController,
        AdminController,
    ],
    providers: [
        // httpErrorFilter,

        environmentConfig,
        ...databaseProviders,
        ...repositoryProviders,
        ...adapterProviders,
        ...migrationTasks,
        contactServiceProvider,
        authServiceProvider,
        userServiceProvider,
        commonServiceProvider,
        networkingServiceProvider,
        policyServiceProvider,
        cipherServiceProvider,
        transactionServiceProvider,
        soapServiceProvider,
        reportServiceProvider,
        adminServiceProvicer,
        adminAuthServiceProvider,

    ],

})
export class AppModule implements OnModuleInit {

    constructor(
        @Inject(ProvinceMigration) // class name
        private readonly _provinceMigration: IMigrationTask,
        @Inject(MongoMigration) // class name
        private readonly _mongoMigration: IMigrationTask,
    ) {
    }

    public onModuleInit(): any {
        this._provinceMigration.run()
        this._mongoMigration.run()
    }
}
