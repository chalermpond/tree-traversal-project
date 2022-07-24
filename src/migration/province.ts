import {
    Inject,
    Injectable,
} from '@nestjs/common'
import {
    Collection,
    Db,
} from 'mongodb'
import {
    from,
    of,
    throwError,
} from 'rxjs'
import { mergeMap } from 'rxjs/operators'
import { IConfig } from '../common/interface/config.interface'
import { ProviderName } from '../provider'
import { IMigrationTask } from './interface/migration.interface'
import * as fs from 'fs'

@Injectable()
export class ProvinceMigration implements IMigrationTask {
    private _provinceCollection: Collection

    constructor(
        @Inject(ProviderName.MongoDBConnectionProvider)
        private readonly _db: Db,
        @Inject(ProviderName.EnvConfigProvider)
        private readonly _config: IConfig,
    ) {
        this._provinceCollection = _db.collection('province')
    }

    public run(): void {
        from(this._provinceCollection.find().count()).pipe(
            mergeMap((total: number) => {

                if (total !== 0) {
                    return throwError(new Error('Province not init, existed'))
                }
                return of({})

            }),
            mergeMap(() => {
                console.log('create new province master data')
                const raw = fs.readFileSync(this._config.static.thailand).toString()
                const json = JSON.parse(raw)
                return from(this._provinceCollection.insertMany(json))
            }),
        ).subscribe(
            () => {
                // nothing
            },
            (e) => {
                console.log('DB Init:' + e.toString())
            },
            () => {
                console.log('completed')
            },
        )
    }

}
