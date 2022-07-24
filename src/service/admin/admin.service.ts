import {
    IAdmin,
    IAdminService,
    IAdminValidator,
} from './interface'
import * as _ from 'lodash'
import { Observable } from 'rxjs'
import {
    HttpException,
    HttpStatus,
    Inject,
} from '@nestjs/common'
import { ProviderName } from '../../provider'
import { IAdminRepositroy } from './interface/repository.interface'
import {
    filter,
    map,
    mergeMap,
    tap,
} from 'rxjs/operators'
import { AdminMapping } from './admin.mapping'
import { AdminDto } from './admin.dto'

const {
    AdminRepositoryProvider,
} = ProviderName

export class AdminService implements IAdminService {
    constructor(
        @Inject(AdminRepositoryProvider)
        private readonly _adminRepository: IAdminRepositroy,
    ) {
    }

    public create(input: IAdminValidator): Observable<any> {
        if (_.isNil(input.getUsername())) {
            throw new HttpException(
                'Username is empty',
                HttpStatus.BAD_REQUEST,
            )
        }

        if (_.isNil(input.getPassword())) {
            throw new HttpException(
                'Password is empty',
                HttpStatus.BAD_REQUEST,
            )
        }

        if (_.isNil(input.getEmail())) {
            throw new HttpException(
                'Email is empty',
                HttpStatus.BAD_REQUEST,
            )
        }
        return this._adminRepository.getByUsername(input.getUsername()).pipe(
            tap(admin => {
                if (_.isNil(admin) !== true) {
                    throw new HttpException(
                        `admin does not duplicate`,
                        HttpStatus.BAD_REQUEST,
                    )
                }
            }),
            map(() => AdminMapping.requestToAdminModelMapping(input)),
            mergeMap((admin: IAdmin) => {
                return this._adminRepository.save(admin)
            }),
        )
    }

    public verifyPassword(username: string, password: string): Observable<any> {
        return this._checkIfUserFound(username).pipe(
            filter((user: IAdmin) => !user.isSuspended()),
            map((user: IAdmin) => {
                const isSuccess = user.challengePassword(password)
                if (isSuccess) {
                    return AdminDto.toAdminDTO(user)
                }
                throw new HttpException(
                    `Verify failed`,
                    HttpStatus.UNAUTHORIZED,
                )
            }),
        )
    }

    private _checkIfUserFound(username: string): Observable<IAdmin> {
        return this._adminRepository.getByUsername(username).pipe(
            tap((user: IAdmin) => {
                if (_.isNil(user)) {
                    throw new HttpException(
                        'User not found',
                        HttpStatus.NOT_FOUND)
                }
            }),
        )
    }
}
