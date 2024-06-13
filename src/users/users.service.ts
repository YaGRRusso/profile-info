import { CreateUserDto } from './dto/create-user.dto'
import { SearchUserDto } from './dto/search-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserDto } from './dto/user.dto'

import { prismaConfig } from '@/common/configs/prisma.config'
import { PaginationDto } from '@/common/dto/input.dto'
import { getPages, getPagination } from '@/common/helpers/pagination.helper'
import { manyIds } from '@/common/helpers/prisma.helper'
import { CommonOutput, PaginatedOutput } from '@/common/interfaces/output.interface'

import { Injectable } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaClient) {}
  public repository = this.prisma.$extends(prismaConfig).user

  async findAll({ limit, page }: PaginationDto): PaginatedOutput<UserDto> {
    const { skip, take } = getPages({ page, limit })

    const [records, count] = await this.repository.findManyAndCount({
      skip,
      take,
      include: { Skills: { select: { id: true } } },
    })

    const pagination = getPagination({ page, count, take })
    const data = records.map(({ Skills, ...course }) => ({
      ...course,
      skills: Skills.map((skill) => skill.id),
    }))

    return { data, pagination }
  }

  async findOne(id: string): CommonOutput<UserDto> {
    return await this.repository.findUnique({ where: { id } })
  }

  async searchAll(
    searchUserDto: SearchUserDto,
    { limit, page }: PaginationDto,
  ): PaginatedOutput<UserDto> {
    const { skip, take } = getPages({ page, limit })

    const [records, count] = await this.repository.findManyAndCount({
      skip,
      take,
      include: { Skills: { select: { id: true } } },
      where: {
        ...searchUserDto,
        ...(searchUserDto.skills?.length && {
          Skills: { some: { id: { in: searchUserDto.skills } } },
        }),
      },
    })

    const pagination = getPagination({ page, count, take })
    const data = records.map(({ Skills, ...course }) => ({
      ...course,
      skills: Skills.map((skill) => skill.id),
    }))

    return { data, pagination }
  }

  async create({ password, skills, ...createUserDto }: CreateUserDto): CommonOutput<UserDto> {
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

  async update(id: string, { skills, ...updateUserDto }: UpdateUserDto): CommonOutput<UserDto> {
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

  async remove(id: string): CommonOutput<UserDto> {
    return await this.repository.delete({ where: { id } })
  }
}
