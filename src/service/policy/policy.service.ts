import {
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
} from '@nestjs/common'
import * as _ from 'lodash'
import {
    Observable,
    of,
} from 'rxjs'
import {
    map,
    mergeMap,
    reduce,
    tap,
    toArray,
} from 'rxjs/operators'
import { ProviderName } from '../../provider'
import { INode } from '../networking/interface/model.interface'
import { INetworkingRepository } from '../networking/interface/repository.interface'
import {
    IPolicyDto,
    IPolicyId,
    IPolicyService,
    IPolicyValidator,
} from './interface'
import { IPolicyRepository } from './interface/repository.interface'
import { PolicyDto } from './policy.dto'
import { PolicyModel } from './policy.model'

const {
    NetworkingRepositoryProvider,
    PolicyRepositoryProvider,
} = ProviderName

@Injectable()
export class PolicyService implements IPolicyService {
    constructor(
        @Inject(PolicyRepositoryProvider)
        private readonly _policyRepository: IPolicyRepository,
        @Inject(NetworkingRepositoryProvider)
        private readonly _networkRepository: INetworkingRepository,
    ) {
    }

    public createNewPolicy(policy: IPolicyValidator): Observable<IPolicyId> {
        return of(this._createPolicyModel(policy)).pipe(
            mergeMap(model => {
                return this._policyRepository.save(model)
            }),
            map(resp => ({
                id: resp.id,
            })),
        )
    }

    /***
     * TODO improve
     */
    retrievePolicy(license: string, citizen: string) {
        const record = this._policyRepository.retrieve(license, citizen)
        return record
    }

    /**
     * @param id: policy number
     */
    getPolicyById(id: string): any {
        return this._policyRepository.getById(id).pipe(
            tap(resp => {
                if (_.isNil(resp)) {
                    throw new HttpException(`policy does not exist`, HttpStatus.NOT_FOUND)
                }
            }),
            mergeMap((model) => {
                return this._networkRepository.getByPolicyId(id).pipe(
                    toArray(),
                    tap((nodes) => {
                        if (nodes.length !== 0) {
                            throw new HttpException(
                                'Policy Number Invalid',
                                HttpStatus.BAD_REQUEST)
                        }
                    }),
                    map(() => model),
                )
            }),
            map(PolicyDto.toPolicyDto),
        )
    }

    public getPersonalPolicy(plate: string, province: string) {
        return this._networkRepository.getByVehicleData(plate, province).pipe(
            map((node: INode) => node.getPolicy().policyNumber),
            mergeMap((policy: string) => this._policyRepository.getById(policy)),
            map(PolicyDto.toPolicyDto),
        )
    }

    /***
     * @param input: citizen id
     */
    public getPolicyByCitizen(input: string): Observable<IPolicyDto[]> {
        return this._policyRepository.getByCitizen(input).pipe(
            tap(resp => {
                if (_.isNil(resp)) {
                    throw new HttpException(
                        `policy does not exist`,
                        HttpStatus.NOT_FOUND,
                    )
                }
            }),
            map(PolicyDto.toPolicyDto),
            reduce((chunk: IPolicyDto[], current: IPolicyDto) => {
                chunk.push(current)
                return chunk
            }, []),
        )
    }

    private _createPolicyModel(policy: IPolicyValidator): PolicyModel {
        const newModel = new PolicyModel(policy.policy)
        return newModel
    }
}
