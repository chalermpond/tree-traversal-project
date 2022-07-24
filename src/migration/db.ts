import {
    Inject,
    Injectable,
} from '@nestjs/common'
import * as _ from 'lodash'
import {
    Collection,
    Cursor,
    Db,
} from 'mongodb'
import {
    from,
    Observable,
    Observer,
    of,
} from 'rxjs'
import {
    concatMap,
    delay,
    filter,
    mergeMap,
    reduce,
    tap,
} from 'rxjs/operators'
import { IConfig } from '../common/interface/config.interface'
import { ProviderName } from '../provider'
import { IMigrationTask } from './interface/migration.interface'

@Injectable()
export class MongoMigration implements IMigrationTask {
    private readonly _policyCollection: Collection
    private readonly _networkingCollection: Collection

    constructor(
        @Inject(ProviderName.MongoDBConnectionProvider)
        private readonly _db: Db,
        @Inject(ProviderName.EnvConfigProvider)
        private readonly _config: IConfig,
    ) {
        this._policyCollection = _db.collection('policy')
        this._networkingCollection = _db.collection('networking')

    }

    public run(): void {
        this._addPolicyDataToNetworking().subscribe()
    }

    private _addPolicyDataToNetworking(): Observable<any> {
        const promise = this._policyCollection.find({}).toArray()
        return from(promise).pipe(
            mergeMap((policies: any[]) => {
                return from(policies)
            }),
            reduce((policyMap, policy) => {
                policyMap.set(policy._id, policy)
                return policyMap
            }, new Map<string, any>()),
        ).pipe(
            mergeMap((policyMap: Map<string, any>) => {
                const cursor = this._networkingCollection.find({})
                return this._toObservable(cursor).pipe(
                    filter((doc) => _.isNil(_.get(doc, 'policy.name'))),
                    concatMap(doc => {
                        const updatePromise = this._networkingCollection.updateOne(
                            {
                                _id: doc._id,
                            }, {
                                $set: {
                                    'policy.name': policyMap.get(doc.policy.no).name,
                                },
                            },
                        )
                        return of(doc)
                    }),
                    tap(doc => {
                        console.log(`policy data migrated on ${doc._id}`)
                    }),
                    delay(50),
                )
            }),
        )
    }

    private _toObservable(source: Cursor): Observable<any> {
        return new Observable((observer: Observer<any>) => {
            source.stream()
                .on('data', (document: any) => {
                    observer.next(document)
                })
                .on('end', () => {
                    source.close()
                    observer.complete()
                })
                .on('error', (err: Error) => {
                    source.close()
                    observer.error(err)
                })
        })
    }
}
