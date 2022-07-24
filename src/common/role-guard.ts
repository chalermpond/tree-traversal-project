import {
    get as _get,
    replace as _replace,
} from 'lodash'
import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
    SetMetadata,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { ProviderName } from '../provider'
import { IAuthService } from '../service/auth/interface/service.interface'
import { Reflector } from '@nestjs/core'

const {
    AdminAuthServiceProvider,
    AuthServiceProvider,
} = ProviderName

export enum RoleAccessLevel {
    Read = 'read',
    Full = 'full',
}

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(
        @Inject(AuthServiceProvider)
        private readonly _authService: IAuthService,
        private readonly _reflector: Reflector,
    ) {
    }

    public static Roles(...roles: string[]) {
        return SetMetadata('roles', roles)
    }

    public canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        // return true // TODO remove this line
        const request = context.switchToHttp().getRequest()
        const headers = request.headers
        const expectedRoles = this._reflector.get<string[]>('roles', context.getHandler())

        const token = _replace(
            _get(headers, 'authorization', ''),
            /^Bearer\s/ig,
            '',
        )

        try {
            const jwt = this._authService.verifyToken(token.toString())

            // TODO to be implement api role
            const roleId = _get(jwt, 'role.id', null)
            // _findIndex(expectedRoles, roleId)

            return !!jwt
        } catch (e) {
            return false
        }
    }
}

@Injectable()
export class AdminGuard extends RoleGuard {
    constructor(
        @Inject(AdminAuthServiceProvider) _authService: IAuthService,
        _reflector: Reflector,
    ) {
        super(_authService, _reflector)
    }
}
