import { CreateUserDto } from './dto/create-user.dto'
import { SearchUserDto } from './dto/search-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserDto } from './dto/user.dto'
import { UsersService } from './users.service'

import { IsPublic } from '@/auth/decorators/public.decorator'
import { NeedRole } from '@/auth/decorators/role.decorator'
import { AuthRequest } from '@/auth/entities/request.entity'
import { JwtAuthGuard } from '@/auth/guards/jwt.guard'
import { RoleGuard } from '@/auth/guards/role.guard'
import { PaginationDto } from '@/common/dto/input.dto'
import { removeObjectKey, removeObjectsKey } from '@/common/helpers/object.helper'

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger'

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiHeader({ name: 'Authorization' })
  @ApiResponse({ type: UserDto })
  @Get('me')
  async findMe(@Req() req: AuthRequest) {
    return removeObjectKey(await this.usersService.findOne(req.user.id), 'password')
  }

  @ApiHeader({ name: 'Authorization' })
  @ApiResponse({ type: UserDto, isArray: true })
  @NeedRole('ADMIN')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    const { data, ...rest } = await this.usersService.findAll(paginationDto)
    return {
      data: removeObjectsKey(data, 'password'),
      ...rest,
    }
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
  async searchAll(@Body() searchUserDto: SearchUserDto, @Query() paginationDto: PaginationDto) {
    const { data, ...rest } = await this.usersService.searchAll(searchUserDto, paginationDto)
    return {
      data: removeObjectsKey(data, 'password'),
      ...rest,
    }
  }

  @ApiResponse({ type: UserDto })
  @IsPublic()
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return removeObjectKey(await this.usersService.create(createUserDto), 'password')
  }

  @ApiHeader({ name: 'Authorization' })
  @ApiResponse({ type: UserDto })
  @Patch('me')
  async update(@Req() req: AuthRequest, @Body() updateUserDto: UpdateUserDto) {
    return removeObjectKey(await this.usersService.update(req.user.id, updateUserDto), 'password')
  }

  @ApiHeader({ name: 'Authorization' })
  @ApiResponse({ type: UserDto })
  @Delete('me')
  async remove(@Req() req: AuthRequest) {
    return removeObjectKey(await this.usersService.remove(req.user.id), 'password')
  }
}
