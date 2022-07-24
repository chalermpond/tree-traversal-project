import { Observable } from 'rxjs'
import { INode } from './model.interface'
import { INodeDto } from './dto.interface'

export interface INetworkingService {

    addRootNode(input: INodeValidator): Observable<INode>

    createNewNode(input: INodeValidator): Observable<INodeDto>

    createNewNodeWithReference(input: INodeValidator, originalReference?: string): Observable<INodeDto>

    getNodeById(id: any): Observable<INode>

    getNodesByCid(cid: string): Observable<INodeDto>

    getNodeByVehicleData(plate: string, province: string): Observable<INodeDto>

    getAvailableChildrenFromAncestor(ancestor: INode): Observable<INode>

    editNode(node: INode): Observable<INode>

    generateReferenceCode(): Observable<string>

    validateReferenceCode(payload: string): Observable<boolean>

    getLeastChildrenNode(): Observable<INode>

    getLeaves(id: string): Observable<INodeDto[]>

    getDirectProfit(ref: string): Observable<number>

    getReferenceProfit(ref: string): Observable<number>

    getYearlyProfit(ref: string, year: number): Observable<number>

    getTotalChildren(ref: string): Observable<number>

    getNewRegistered(ref: string, month: number): Observable<number>

    getNodeByPolicy(input: string): Observable<INode>

    getChildrenByParentId(input: string): Observable<INode[]>
}

export interface INodeValidator {
    getCid(): string

    getPlate(): string

    getProvince(): string

    getPolicy(): IPolicy

    getBank(): IBankData

    getReference(): string
}

export interface IPolicy {
    no: string
    effectiveDate: number,
    expiryDate: number,
}

export interface IBankData {
    accountNumber: string
    name: string
}
