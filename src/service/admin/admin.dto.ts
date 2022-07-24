import { IAdmin } from './interface'
import { IAdminDto } from './interface/dto.interface'
import { isNil } from '@nestjs/common/utils/shared.utils'

export class AdminDto {
    public static toAdminDTO(input: IAdmin): IAdminDto {
        if (isNil(input)) {
            return null
        }
        return {
            username: input.getUsername(),
            email: input.getEmail() || '',
            suspended: input.isSuspended(),
        }
    }
}
