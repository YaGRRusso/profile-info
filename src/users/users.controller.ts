import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common'
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { SearchUserDto } from './dto/search-user.dto'
import { ApiTags } from '@nestjs/swagger'
import { removeObjectKey, removeObjectsKey } from '@helpers/object.helper'
import { IsPublic } from '@auth/decorators/public.decorator'
import { AuthRequest } from '@auth/entities/request.entity'

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
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return removeObjectKey(await this.usersService.findOne(id), 'password')
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
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return removeObjectKey(
      await this.usersService.create(createUserDto),
      'password',
    )
  }

  @Patch('me')
  async update(@Req() req: AuthRequest, @Body() updateUserDto: UpdateUserDto) {
    return removeObjectKey(
      await this.usersService.update(req.user.id, updateUserDto),
      'password',
    )
  }

  @Patch('me/skills/add')
  addSkills(@Req() req: AuthRequest, @Body() { skills }: UpdateUserDto) {
    return this.usersService.addSkills(req.user.id, skills)
  }

  @Patch('me/skills/remove')
  removeSkills(@Req() req: AuthRequest, @Body() { skills }: UpdateUserDto) {
    return this.usersService.removeSkills(req.user.id, skills)
  }

  @Delete('me')
  async remove(@Req() req: AuthRequest) {
    return removeObjectKey(
      await this.usersService.remove(req.user.id),
      'password',
    )
  }
}
