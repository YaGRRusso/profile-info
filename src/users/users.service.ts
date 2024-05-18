import { CreateUserDto } from './dto/create-user.dto'
import { SearchUserDto } from './dto/search-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserDto } from './dto/user.dto'

import { manyIds } from '@/common/helpers/prisma.helper'
import { Output } from '@/common/interfaces/output.interface'

import { Injectable } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaClient) {}
  private repository = this.prisma.user

  async findAll(): Output<UserDto[]> {
    return await this.repository.findMany()
  }

  async findOne(id: string): Output<UserDto> {
    return await this.repository.findUnique({ where: { id } })
  }

  async searchAll(searchUserDto: SearchUserDto): Output<UserDto[]> {
    return await this.repository.findMany({
      where: {
        ...searchUserDto,
        ...(searchUserDto.skills?.length && {
          Skills: { some: { id: { in: searchUserDto.skills } } },
        }),
      },
    })
  }

  async create({
    password,
    skills,
    ...createUserDto
  }: CreateUserDto): Output<UserDto> {
    const hash = await bcrypt.hash(password, 8)
    return await this.repository.create({
      data: {
        ...createUserDto,
        password: hash,
        role: 'USER',
        ...(skills && {
          Skills: { connect: manyIds(skills) },
        }),
      },
    })
  }

  async update(
    id: string,
    { skills, ...updateUserDto }: UpdateUserDto,
  ): Output<UserDto> {
    return await this.repository.update({
      where: { id },
      data: {
        ...updateUserDto,
        ...(skills && {
          Skills: { set: [], connect: manyIds(skills) },
        }),
      },
    })
  }

  async remove(id: string): Output<UserDto> {
    return await this.repository.delete({ where: { id } })
  }
}
