import { IRepository } from '../../../common/interface/repository.interface'
import {
    INode,
    NodeStatus,
    PaymentStatus,
} from './model.interface'
import { Observable } from 'rxjs'

export interface INodeQuery {
    paymentStatus?: PaymentStatus,
    nodeStatus?: NodeStatus,
}

export interface INetworkingRepository extends IRepository<INode> {
    getById(id: string): Observable<INode>

    getByVehicleData(plate: string, province: string): Observable<INode>

    save(node: INode): Observable<INode>

    update(node: INode): Observable<INode>

    create(node: INode): Observable<{ id: string }>

    getNetwork(root: INode, maxLevel: number): Observable<INode>

    getRoot(): Observable<INode>

    getChildren(node: INode): Observable<INode>

    getLeaves(node: INode): Observable<INode>

    getByCitizen(cid: string): Observable<INode>

    getByPolicyId(policyId: string): Observable<INode>

    getAvailableNodeFromReference(node: INode): Observable<INode>

    queryByDuration(start: Date, end: Date, status?: INodeQuery): Observable<INode>

    getByMultipleId(id: string[]): Observable<INode>

    getNodeByPolicy(input: string): Observable<INode>
}
