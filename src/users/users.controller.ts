import { CreateUserDto } from './dto/create-user.dto'
import { SearchUserDto } from './dto/search-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserDto } from './dto/user.dto'
import { UsersService } from './users.service'

import { IsPublic } from '@auth/decorators/public.decorator'
import { NeedRole } from '@auth/decorators/role.decorator'
import { AuthRequest } from '@auth/entities/request.entity'
import { JwtAuthGuard } from '@auth/guards/jwt.guard'
import { RoleGuard } from '@auth/guards/role.guard'
import { removeObjectKey, removeObjectsKey } from '@helpers/object.helper'

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import { ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger'

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiHeader({ name: 'Authorization' })
  @ApiResponse({ type: UserDto, isArray: true })
  @NeedRole('ADMIN')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get()
  async findAll() {
    return removeObjectsKey(await this.usersService.findAll(), 'password')
  }

  @ApiHeader({ name: 'Authorization' })
  @ApiResponse({ type: UserDto })
  @NeedRole('ADMIN')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return removeObjectKey(await this.usersService.findOne(id), 'password')
  }

  @ApiHeader({ name: 'Authorization' })
  @ApiResponse({ type: UserDto, isArray: true })
  @NeedRole('ADMIN')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get('search')
  async searchAll(@Body() searchUserDto: SearchUserDto) {
    return removeObjectsKey(
      await this.usersService.searchAll(searchUserDto),
      'password',
    )
  }

  @ApiResponse({ type: UserDto })
  @IsPublic()
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return removeObjectKey(
      await this.usersService.create(createUserDto),
      'password',
    )
  }

  @ApiHeader({ name: 'Authorization' })
  @ApiResponse({ type: UserDto })
  @Patch('me')
  async update(@Req() req: AuthRequest, @Body() updateUserDto: UpdateUserDto) {
    return removeObjectKey(
      await this.usersService.update(req.user.id, updateUserDto),
      'password',
    )
  }

  @ApiHeader({ name: 'Authorization' })
  @ApiResponse({ type: UserDto })
  @Patch('me/skills/add')
  addSkills(@Req() req: AuthRequest, @Body() { skills }: UpdateUserDto) {
    return this.usersService.addSkills(req.user.id, skills)
  }

  @ApiHeader({ name: 'Authorization' })
  @ApiResponse({ type: UserDto })
  @Patch('me/skills/remove')
  removeSkills(@Req() req: AuthRequest, @Body() { skills }: UpdateUserDto) {
    return this.usersService.removeSkills(req.user.id, skills)
  }

  @ApiHeader({ name: 'Authorization' })
  @ApiResponse({ type: UserDto })
  @Delete('me')
  async remove(@Req() req: AuthRequest) {
    return removeObjectKey(
      await this.usersService.remove(req.user.id),
      'password',
    )
  }
}
