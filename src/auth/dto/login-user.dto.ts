import { UserDto } from '@src/users/dto/user.dto'

import { PickType } from '@nestjs/swagger'

export class LoginUserDto extends PickType(UserDto, ['email', 'password']) {}
