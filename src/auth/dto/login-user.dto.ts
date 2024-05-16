import { UserDto } from '@/users/dto/user.dto'

import { PickType } from '@nestjs/swagger'

export class LoginUserDto extends PickType(UserDto, ['email', 'password']) {}

export class MeDto extends PickType(UserDto, ['id', 'name', 'email', 'role']) {}
