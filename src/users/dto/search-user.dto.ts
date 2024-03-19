import { CreateUserDto } from './create-user.dto'

import { PartialType } from '@nestjs/swagger'

export class SearchUserDto extends PartialType(CreateUserDto) {}
