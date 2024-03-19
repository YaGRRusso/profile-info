import { UserDto } from './user.dto'

import { PickType } from '@nestjs/swagger'

export class CreateUserDto extends PickType(UserDto, [
  'name',
  'birth',
  'description',
  'email',
  'password',
  'nickname',
  'phone',
  'picture',
  'address',
  'postal',
  'presentation',
  'title',
  'skills',
]) {}
