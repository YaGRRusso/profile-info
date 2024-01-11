import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common'
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { SearchUserDto } from './dto/search-user.dto'
import { ApiTags } from '@nestjs/swagger'
import { removeObjectKey, removeObjectsKey } from '@helpers/object.helper'
import { IsPublic } from '@auth/decorators/public.decorator'

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @IsPublic()
  @Get()
  async findAll() {
    return removeObjectsKey(await this.usersService.findAll(), 'password')
  }

  @IsPublic()
  @Get('search')
  async searchAll(@Body() searchUserDto: SearchUserDto) {
    return removeObjectsKey(
      await this.usersService.searchAll(searchUserDto),
      'password',
    )
  }

  @IsPublic()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return removeObjectKey(await this.usersService.findOne(id), 'password')
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return removeObjectKey(
      await this.usersService.create(createUserDto),
      'password',
    )
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return removeObjectKey(
      await this.usersService.update(id, updateUserDto),
      'password',
    )
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return removeObjectKey(await this.usersService.remove(id), 'password')
  }
}
