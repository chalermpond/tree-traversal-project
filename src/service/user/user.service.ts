import { tap } from 'rxjs/internal/operators/tap'
import * as _ from 'lodash'
import { IPolicyRepository } from '../policy/interface/repository.interface'
import {
    IProfile,
    IProfileDto,
    IProfileValidator,
    IUser,
    IUserService,
    IUserValidator,
} from './interface'
import {
    forkJoin,
    iif,
    Observable,
    of,
} from 'rxjs'
import {
    IProfileRepository,
    IUserRepository,
} from './interface/repository.interface'
// import { IEventBus } from '../../common/interface/event-bus'
import {
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
} from '@nestjs/common'
import {
    catchError,
    filter,
    map,
    mergeMap,
    toArray,
} from 'rxjs/operators'
import { UserMapping } from './user.mapping'
import { UserDto } from './user.dto'
import { IUserDto } from './interface/dto.interface'
import { ProviderName } from '../../provider'
import { ProfileModel } from './profile.model'

const {
    UserRepositoryProvider,
    ProfileRepositoryProvider,
    PolicyRepositoryProvider,
} = ProviderName

@Injectable()
export class UserService implements IUserService {
    constructor(
        // private readonly _eventBus: IEventBus,
        @Inject(UserRepositoryProvider)
        private readonly _userRepository: IUserRepository,
        @Inject(ProfileRepositoryProvider)
        private readonly _profileRepository: IProfileRepository,
        @Inject(PolicyRepositoryProvider)
        private readonly _policyRepository: IPolicyRepository,
    ) {
    }

    /**
     * Create new user from input
     * @param input IUserValidator
     */
    public create(input: IUserValidator): Observable<any> {
        if (_.isNil(input.getPassword())) {
            throw new HttpException('Empty password provided',
                HttpStatus.BAD_REQUEST)
        }

        if (_.isNil(input.getCitizen())) {
            throw new HttpException('Empty CID provided',
                HttpStatus.BAD_REQUEST)
        }

        return this._userRepository.getById(input.getId()).pipe(
            tap((user: IUser) => {
                if (!_.isNil(user)) {
                    throw new HttpException(
                        'User existed',
                        HttpStatus.FORBIDDEN)
                }
            }),
            map(() => UserMapping.requestToUserModelMapping(input)),
            mergeMap((user: IUser) => {
                const citizen = user.getCitizen()
                return this._profileRepository.getById(citizen).pipe(
                    catchError(() => of({})),
                    map((resp) => {
                        console.error(resp)
                        return {
                            user,
                            profile: _.isEmpty(resp)
                                ? null : resp,
                        }
                    }),
                )
            }),
            mergeMap(({user, profile}) => {
                return this._userRepository.save(user).pipe(
                    mergeMap(({id}) => {
                        return this._userRepository.getById(id)
                    }),
                    map((userModel: IUser) => ({
                        user: userModel,
                        profile,
                    })),
                )
            }),
            mergeMap(({user, profile}) => {
                const createProfile$ = of(user).pipe(
                    mergeMap(model => {
                        console.log('create new profile')
                        const newProfile = new ProfileModel(model.getCitizen())
                        newProfile.setEmail(model.getEmail())
                        newProfile.setName(model.getName())
                        newProfile.setPhone(model.getPhone())
                        newProfile.addUser(model)
                        return this._profileRepository.create(newProfile)
                    }),
                )

                const addUserToProfile$ = of(profile).pipe(
                    mergeMap((model: IProfile) => {
                        console.log('update existing profile')
                        model.addUser(user)
                        return this._profileRepository.updateUsers(model)
                    }),
                )

                return iif(() => _.isNil(profile),
                    createProfile$,
                    addUserToProfile$,
                )
            }),
            map(() => ({success: true})),
        )
    }

    public getProfile(id: string): Observable<IProfileDto> {
        return this._profileRepository.getById(id).pipe(
            map((profile: IProfile) => {
                return UserDto.toProfileDto(profile)
            }),
        )
    }

    public suspend(id: string): Observable<any> {
        return this._checkIfUserFound(id).pipe(
            mergeMap((user: IUser) => {
                user.setSuspend(true)
                return this._userRepository.update(user)
            }),
        )
    }

    public reactivate(id: string): Observable<any> {
        return this._checkIfUserFound(id).pipe(
            mergeMap((user: IUser) => {
                user.setSuspend(false)
                return this._userRepository.update(user)
            }),
        )
    }

    public update(id: string, input: IUserValidator): Observable<any> {
        const inputId = input.getId()
        if (!_.isNil(inputId) && id !== inputId) {
            throw new HttpException(
                `Username change not allowed`,
                HttpStatus.BAD_REQUEST,
            )
        }
        return this._checkIfUserFound(id).pipe(
            map((user: IUser) => UserMapping.requestToUserModelMapping(input, user)),
            mergeMap((user: IUser) => this._userRepository.update(user)),
            map((resp: any) => ({id: resp.id})),
        )
    }

    public verifyPassword(username: string, password: string): Observable<IUserDto> {
        return this._checkIfUserFound(username).pipe(
            filter((user: IUser) => !user.isSuspended()),
            map((user: IUser) => {
                const isSuccess = user.challengePassword(password)
                if (isSuccess) {
                    return UserDto.toUserDTO(user)
                }
                throw new HttpException(
                    `Verify failed`,
                    HttpStatus.UNAUTHORIZED,
                )
            }),
        )
    }

    /**
     * Get single user information
     * @param id
     */
    public getUser(id: string): Observable<any> {
        return this._checkIfUserFound(id).pipe(
            filter((user: IUser) => !user.isSuspended()),
            tap((user: IUser) => {
                if (_.isNil(user)) {
                    throw new HttpException(
                        'User not found',
                        HttpStatus.NOT_FOUND)
                }
            }),
            map(UserDto.toUserDTO),
        )
    }

    /**
     * list users
     * @param page
     * @param limit
     */
    public list(page: number = 1, limit: number = 0): Observable<any> {
        return forkJoin([
                this._userRepository.total(),
                this._userRepository.list(page, limit).pipe(toArray()),
            ],
        ).pipe(
            map((resp: any[]) => {
                const total = resp[0]
                const data = resp[1].map(UserDto.toUserDTO)
                return {
                    page,
                    limit,
                    total,
                    data,
                }
            }),
        )
    }

    private _checkIfUserFound(userId: string): Observable<IUser> {
        return this._userRepository.getById(userId).pipe(
            tap((user: IUser) => {
                if (_.isNil(user)) {
                    throw new HttpException(
                        'User not found',
                        HttpStatus.NOT_FOUND)
                }
            }),
        )
    }

    public updateProfile(cid: string, payload: IProfileValidator): Observable<IProfileDto> {
        return this._profileRepository.getById(cid).pipe(
            map((model: IProfile) => {
                if (!_.isNil(payload.getFullName())) {
                    model.setName(payload.getFullName())
                }
                if (!_.isNil(payload.getEmail())) {
                    model.setEmail(payload.getEmail())
                }
                if (!_.isNil(payload.getPhone())) {
                    model.setPhone(payload.getPhone())
                }

                return model
            }),
            mergeMap((updatedModel: IProfile) => this._profileRepository.updateProfile(updatedModel)),
            map((model: IProfile) => UserDto.toProfileDto(model)),
        )
    }

}
