import { Observable } from 'rxjs'
import {
    IProfile,
    IUser,
} from './model.interface'
import { IRepository } from '../../../common/interface/repository.interface'

export interface IUserRepository extends IRepository<IUser> {
    list(page: number, limit: number): Observable<IUser>
    getById(id: string): Observable<IUser>
    save(model: IUser): Observable<{id: string}>
    update(model: IUser): Observable<any>
    getByMultipleId(ids: string[]): Observable<IUser>
}

export interface IProfileRepository extends IRepository<IProfile> {
    getById(id: string): Observable<IProfile>
    create(profile: IProfile): Observable<IProfile>
    updateUsers(profile: IProfile): Observable<IProfile>
    updateProfile(profile: IProfile): Observable<IProfile>
}
