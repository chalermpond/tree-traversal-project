import {
    HttpException,
    HttpStatus,
    Inject,
} from '@nestjs/common'
import * as _ from 'lodash'
import {
    forkJoin,
    from,
    Observable,
    of,
} from 'rxjs'
import {
    catchError,
    filter,
    first,
    map,
    mergeMap,
    reduce,
    tap,
    toArray,
} from 'rxjs/operators'
import { IConfig } from '../../common/interface/config.interface'

import { ProviderName } from '../../provider'
import { IPolicyModel } from '../policy/interface'
import { IPolicyRepository } from '../policy/interface/repository.interface'
import {
    INodeDto,
} from './interface/dto.interface'
import {
    IBankAccount,
    ILicensePlate,
    INode,
    IPolicy,
    PaymentStatus,
} from './interface/model.interface'
import { INetworkingRepository } from './interface/repository.interface'

import {
    INetworkingService,
    INodeValidator,
} from './interface/service.interface'
import { NodeModel } from './node.model'

const {
    EnvConfigProvider,
    NetworkingRepositoryProvider,
    PolicyRepositoryProvider,
} = ProviderName

export class NetworkingService implements INetworkingService {
    private readonly _charset: string
    private readonly _numberSet: string
    private readonly _charLength: number = 2
    private readonly _numberLength: number = 5
    private readonly _maxChildren: number = 8
    private readonly _directProfit: number
    private readonly _referenceProfit: number

    constructor(
        @Inject(NetworkingRepositoryProvider)
        private readonly _networkingRepository: INetworkingRepository,
        @Inject(EnvConfigProvider)
        private readonly _config: IConfig,
        @Inject(PolicyRepositoryProvider)
        private readonly _policyRepository: IPolicyRepository,
    ) {
        this._charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        this._numberSet = '0123456789'
        this._directProfit = this._config.node.dp || 0
        this._referenceProfit = this._config.node.rp || 0
    }

    public addRootNode(input: INodeValidator): Observable<INode> {
        return this._networkingRepository.list(1, 1).pipe(
            toArray(),
            tap((array: INode[]) => {
                if (!_.isEmpty(array)) {
                    throw new HttpException(
                        'Cannot add root node',
                        HttpStatus.FORBIDDEN,
                    )
                }
            }),
        ).pipe(
            mergeMap(() => this._policyRepository.getById(input.getPolicy().no)),
            map((policyModel: IPolicyModel) => this._createNodeModel('AA000000', input, policyModel, 0)),
            mergeMap((node: INode) => this._networkingRepository.create(node)),
            mergeMap(({id}) => this._networkingRepository.getById(id)),
        )
    }

    public generateReferenceCode(): Observable<string> {

        const charCode = Array(this._charLength)

        _.forEach(charCode, (value, index, src) => {
            const charIndex = _.random(0, this._charset.length - 1, false)
            src[index] = this._charset.charAt(charIndex).toString()
        })

        const numberCode = Array(this._numberLength)
        _.forEach(numberCode, (value, index, src) => {
            const charIndex = _.random(0, this._numberSet.length - 1, false)
            src[index] = this._numberSet.charAt(charIndex).toString()
        })

        const code = (_.concat(charCode, numberCode))
        const result = _.join(code, '') + this.getChecksum(code).toString()

        return of({}).pipe(
            mergeMap(() => this._isReferenceCodeAvailable(result)),
            mergeMap(available => {
                if (!!available) {
                    return of(result)
                }
                return this.generateReferenceCode()
            }),
        )

    }

    public validateReferenceCode(payload: string): Observable<boolean> {
        const data = payload.slice(0, payload.length - 1)
        const checkSum = payload.charAt(payload.length - 1)
        const calculatedSum = this.getChecksum(_.toArray(data)).toString()
        return of(calculatedSum === checkSum)
    }

    private getChecksum(data: string[]): number {
        const acc = _.reduce(data, (total, current) => total + current.charCodeAt(0), 0)
        return acc % 10
    }

    public createNewNode(input: INodeValidator): Observable<INodeDto> {
        return this._networkingRepository.getRoot().pipe(
            mergeMap((rootNode: INode) => {
                const reference = rootNode.getId()
                _.assign(input, {
                    reference,
                })
                return this.createNewNodeWithReference(input)
            }),
            catchError(e => {
                return this.addRootNode(input).pipe(
                    map(this._createNodeDto),
                )
            }),
        )
    }

    public getLeaves(id: string): Observable<INodeDto[]> {
        return this._networkingRepository.getById(id).pipe(
            mergeMap(node => this._networkingRepository.getLeaves(node)),
            map(this._createNodeDto),
            toArray(),
        )
    }

    public createNewNodeWithReference(input: INodeValidator, originalReference?: string): Observable<INodeDto> {
        return of(input).pipe(
            tap((data: INodeValidator) => {
                const refCode = data.getReference()
                if (_.isNil(refCode)) {
                    throw new HttpException('Reference Required',
                        HttpStatus.BAD_REQUEST)
                }
            }),
            mergeMap((data: INodeValidator) => {
                return this.validateReferenceCode(data.getReference()).pipe(
                    tap(isValid => {
                        if (!isValid) {
                            throw new HttpException('Reference code not valid',
                                HttpStatus.BAD_REQUEST)
                        }
                    }),
                    mergeMap(() => {
                        return this._networkingRepository.getById(data.getReference())
                    }),
                )
            }),
            mergeMap((refNode: INode) => {
                if (refNode.getTotalChildren() < 8) {
                    return of(refNode)
                }
                return this._networkingRepository.getAvailableNodeFromReference(refNode)
            }),
            mergeMap((refNode: INode) => {
                refNode.increaseChildrenCount()
                return this._networkingRepository.update(refNode)
            }),
            mergeMap((parentNode: INode) => {
                return this.generateReferenceCode().pipe(
                    mergeMap((code: string) => {
                        return this._policyRepository.getById(input.getPolicy().no).pipe(
                            map(policyModel => ({
                                code,
                                policyModel,
                            })),
                        )
                    }),
                    map(({code, policyModel}: { code: string, policyModel: IPolicyModel }) => {
                        return this._createNodeModel(code, input, policyModel, parentNode.getLevel() + 1, parentNode)
                    }),
                    map((newNode: INode) => {
                        if (!_.isNil(originalReference)) {
                            newNode.setOriginalReference(originalReference)
                        }
                        return newNode
                    }),
                )
            }),
            mergeMap((newNode) => {
                return this._networkingRepository.create(newNode).pipe(
                    map(() => newNode),
                )
            }),
            map((node) => this._createNodeDto(node)),
        )
    }

    public editNode(node: INode): Observable<INode> {
        return undefined
    }

    public getAvailableChildrenFromAncestor(ancestor: INode): Observable<INode> {

        return this._networkingRepository.getLeaves(ancestor).pipe(
            toArray(),
            mergeMap((children: INode[]) => {
                if (children.length < this._maxChildren) {
                    // refNode still available to add new children
                    return of(ancestor)
                }

                // ancestor was full, get available from leaves
                return this._getFirstAvailableNode(children).pipe(
                    mergeMap((node: INode) => {
                        // first leaf node that pass condition, or null if all not passed
                        if (_.isNil(node)) {
                            return of(children).pipe(
                                mergeMap((all) => this._getFirstAvailableNode(all)),
                            )
                        }
                        return of(node)
                    }),
                )
            }),
        )
    }

    private _getFirstAvailableNode(nodes: INode[]): Observable<INode> {
        const leaves: INode[] = []
        return from(nodes).pipe(
            mergeMap((node: INode) => {
                return this._networkingRepository.getLeaves(node).pipe(
                    toArray(),
                    map((children: INode[]) => {
                        leaves.push(...children)
                        return {
                            node,
                            children,
                        }

                    }),
                )
            }),
            first(({node, children}) => children.length < this._maxChildren,
                {
                    node: null,
                    children: [],
                }),
            mergeMap(({node, children}) => {
                if (_.isNil(node)) {
                    return this._getFirstAvailableNode(leaves)
                }
                return of(node)
            }),
        )
    }

    public getNodeById(id: any): Observable<INode> {
        return undefined
    }

    public getLeastChildrenNode(): Observable<INode> {
        // TODO
        return this._networkingRepository.getRoot().pipe(
            mergeMap((rootNode: INode) => {
                return this._networkingRepository.getChildren(rootNode)
            }),
            reduce((leaseNode, current) => {
                if (_.isNil(leaseNode) || leaseNode.getParents()) {
                    return current
                }

            }),
        )
    }

    private _createNodeModel(id: string, input: INodeValidator, policyModel: IPolicyModel, level: number, parent?: INode): INode {
        const ecid: string = input.getCid()
        const plate: ILicensePlate = {
            name: input.getPlate(),
            province: input.getProvince(),
        }
        const policy: IPolicy = {
            effectiveDate: new Date(policyModel.getStart()),
            expiryDate: new Date(policyModel.getExpire()),
            policyNumber: policyModel.getPolicyNumber(),
            name: policyModel.getFullName(),
        }

        const inputBank = input.getBank()
        const bankAccount: IBankAccount = {
            accountNumber: inputBank.accountNumber,
            bankName: inputBank.name,
        }

        const rootNode = new NodeModel(
            id,
            ecid,
            plate,
            policy,
            bankAccount,
            level,
        )

        if (_.isNil(parent)) {
            return rootNode
        }
        rootNode.setParents(parent)
        return rootNode

    }

    private _createNodeDto(model: INode): INodeDto {
        return {
            account: model.getBankAccount().accountNumber,
            bank: model.getBankAccount().bankName,
            effective: model.getPolicy().effectiveDate.getTime(),
            expiry: model.getPolicy().expiryDate.getTime(),
            plate: model.getPlate().name,
            policy: model.getPolicy().policyNumber,
            province: model.getPlate().province,
            ref: model.getId(),
        }
    }

    private _isReferenceCodeAvailable(code: string): Observable<boolean> {
        return of({}).pipe(
            mergeMap(() => {
                return this._networkingRepository.getById(code).pipe(
                    catchError((err: Error) => {
                        if (err instanceof HttpException && err.getStatus() === HttpStatus.NOT_FOUND) {
                            return of(false)
                        }
                    }),
                )
            }),
            map(duplicated => {
                return !duplicated
            }),
        )
    }

    public getNodeByVehicleData(plate: string, province: string): Observable<INodeDto> {
        return this._networkingRepository.getByVehicleData(plate, province).pipe(
            map(this._createNodeDto),
        )
    }

    public getNodesByCid(cid: string): Observable<INodeDto> {
        return this._networkingRepository.getByCitizen(cid).pipe(
            map((model: INode) => this._createNodeDto(model)),
        )
    }

    public getDirectProfit(ref: string): Observable<number> {
        return this._networkingRepository.getById(ref).pipe(
            filter((model: INode) => model.getPaymentStatus() === PaymentStatus.Unpaid),
            map(model => {
                if (_.isNil(model)) {
                    return 0
                }
                return this._directProfit
            }),
        )
    }

    public getReferenceProfit(ref: string): Observable<number> {
        return this._networkingRepository.getById(ref).pipe(
            mergeMap((refModel: INode) => this._networkingRepository.getChildren(refModel)),
            reduce((total, current) => {
                if (current.getPaymentStatus() === PaymentStatus.Unpaid) {
                    return total + 1
                }
                return total
            }, 0),
            map((total) => total * this._referenceProfit),
        )
    }

    public getYearlyProfit(ref: string, year: number): Observable<number> {
        return this._networkingRepository.getById(ref).pipe(
            mergeMap((refNode: INode) => {
                return forkJoin([
                    this._getYearNodeProfit(refNode, year),
                    this._getYearChildrenProfit(refNode, year),
                ])
            }),
            map(_.sum),
        )
    }

    private _getYearNodeProfit(node: INode, year: number): Observable<number> {
        if (node.getCreatedDate().getFullYear() === year) {
            return of(this._directProfit)
        }
        return of(0)

    }

    private _getYearChildrenProfit(node: INode, year: number): Observable<number> {
        return this._networkingRepository.getChildren(node).pipe(
            reduce((total, current) => {
                if (current.getCreatedDate().getFullYear() === year) {
                    return total + 1
                }
                return total
            }, 0),
            map((total: number) => total * this._referenceProfit),
        )
    }

    public getNewRegistered(ref: string, month: number): Observable<number> {
        return this._networkingRepository.getById(ref).pipe(
            mergeMap((refNode: INode) => this._networkingRepository.getChildren(refNode)),
            reduce((total: number, current) => {
                if (current.getCreatedDate().getMonth() === month) {
                    return total + 1
                }
                return total
            }, 0),
        )
    }

    public getTotalChildren(ref: string): Observable<number> {
        return this._networkingRepository.getById(ref).pipe(
            mergeMap((refModel: INode) => this._networkingRepository.getChildren(refModel)),
            reduce((total: number) => total + 1, 0),
        )
    }

    public getNodeByPolicy(input: string): Observable<INode> {
        return this._networkingRepository.getNodeByPolicy(input).pipe(
            tap((node: INode) => {
                if (_.isNil(node)) {
                    throw new HttpException(
                        `does not exist node`,
                        HttpStatus.NOT_FOUND,
                    )
                }
            }),
        )
    }

    public getChildrenByParentId(input: string): Observable<any> {
        return this._networkingRepository.getById(input).pipe(
            tap((node: INode) => {
                if (_.isNil(node)) {
                    throw new HttpException(
                        `does not exist node`,
                        HttpStatus.NOT_FOUND,
                    )
                }
            }),
            mergeMap((model: INode) => this._networkingRepository.getLeaves(model)),
            map((model: INode) => this._createNodeDto(model)),
            toArray(),
        )
    }

}
