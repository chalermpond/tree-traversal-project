import {
    IProfile,
    IProfileDto,
    IUser,
} from './interface'
import { IUserDto } from './interface/dto.interface'
import { isNil } from '@nestjs/common/utils/shared.utils'

export class UserDto {
    public static toUserDTO(input: IUser): IUserDto {
        if (isNil(input)) {
            return null
        }
        return {
            id: input.getUserName(),
            name: input.getName(),
            email: input.getEmail() || '',
            suspended: input.isSuspended(),
            phone: input.getPhone() || '',
            cid: input.getCitizen(),
        }
    }

    public static toProfileDto(input: IProfile): IProfileDto {
        return {
            cid: input.getId(),
            email: input.getEmail() || '',
            fullName: input.getName() || '',
            phone: input.getPhone() || '',
        }

    }
}
