import { CreateSkillDto } from './dto/create-skill.dto'
import { SearchSkillDto } from './dto/search-skill.dto'
import { SkillDto } from './dto/skill.dto'
import { UpdateSkillDto } from './dto/update-skill.dto'

import { prismaConfig } from '@/common/configs/prisma.config'
import { PaginationDto } from '@/common/dto/input.dto'
import { getPages, getPagination } from '@/common/helpers/pagination.helper'
import { CommonOutput, PaginatedOutput } from '@/common/interfaces/output.interface'

import { Injectable } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class SkillsService {
  constructor(private prisma: PrismaClient) {}
  public repository = this.prisma.$extends(prismaConfig).skill

  async findAll(userId: string, { limit, page }: PaginationDto): PaginatedOutput<SkillDto> {
    const { skip, take } = getPages({ page, limit })

    const [records, count] = await this.repository.findManyAndCount({
      skip,
      take,
      where: { userId },
    })

    const pagination = getPagination({ page, count, take })
    return { data: records, pagination }
  }

  async findOne(userId: string, id: string): CommonOutput<SkillDto> {
    return await this.repository.findUnique({ where: { id, userId } })
  }

  async searchAll(
    userId: string,
    searchSkillDto: SearchSkillDto,
    { limit, page }: PaginationDto,
  ): PaginatedOutput<SkillDto> {
    const { skip, take } = getPages({ page, limit })

    const [records, count] = await this.repository.findManyAndCount({
      skip,
      take,
      where: {
        ...searchSkillDto,
        userId,
      },
    })

    const pagination = getPagination({ page, count, take })
    return { data: records, pagination }
  }

  async create(userId: string, createSkillDto: CreateSkillDto): CommonOutput<SkillDto> {
    return await this.repository.create({
      data: { ...createSkillDto, userId },
    })
  }

  async update(userId: string, id: string, updateSkillDto: UpdateSkillDto): CommonOutput<SkillDto> {
    return await this.repository.update({
      where: { id, userId },
      data: { ...updateSkillDto },
    })
  }

  async remove(userId: string, id: string): CommonOutput<SkillDto> {
    return await this.repository.delete({ where: { id, userId } })
  }
}
