import { CreateFormationDto } from './dto/create-formation.dto'
import { FormationDto } from './dto/formation.dto'
import { SearchFormationDto } from './dto/search-formation.dto'
import { UpdateFormationDto } from './dto/update-formation.dto'

import { prismaConfig } from '@/common/configs/prisma.config'
import { PaginationDto } from '@/common/dto/input.dto'
import { getPages, getPagination } from '@/common/helpers/pagination.helper'
import { manyIds } from '@/common/helpers/prisma.helper'
import { CommonOutput, PaginatedOutput } from '@/common/interfaces/output.interface'

import { Injectable } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class FormationsService {
  constructor(private prisma: PrismaClient) {}
  public repository = this.prisma.$extends(prismaConfig).formation

  async findAll(userId: string, { limit, page }: PaginationDto): PaginatedOutput<FormationDto> {
    const { skip, take } = getPages({ page, limit })

    const [records, count] = await this.repository.findManyAndCount({
      skip,
      take,
      include: { Skills: { select: { id: true } } },
      where: { userId },
    })

    const pagination = getPagination({ page, count, take })
    const data = records.map(({ Skills, ...course }) => ({
      ...course,
      skills: Skills.map((skill) => skill.id),
    }))

    return { data, pagination }
  }

  async findOne(userId: string, id: string): CommonOutput<FormationDto> {
    return await this.repository.findUnique({ where: { id, userId } })
  }

  async searchAll(
    userId: string,
    searchFormationDto: SearchFormationDto,
    { limit, page }: PaginationDto,
  ): PaginatedOutput<FormationDto> {
    const { skip, take } = getPages({ page, limit })

    const [records, count] = await this.repository.findManyAndCount({
      skip,
      take,
      include: { Skills: { select: { id: true } } },
      where: {
        ...searchFormationDto,
        ...(searchFormationDto.skills?.length && {
          Skills: { some: { id: { in: searchFormationDto.skills } } },
        }),
        userId,
      },
    })

    const pagination = getPagination({ page, count, take })
    const data = records.map(({ Skills, ...course }) => ({
      ...course,
      skills: Skills.map((skill) => skill.id),
    }))

    return { data, pagination }
  }

  async create(
    userId: string,
    { skills, ...createFormationDto }: CreateFormationDto,
  ): CommonOutput<FormationDto> {
    return await this.repository.create({
      data: {
        ...createFormationDto,
        ...(skills?.length && {
          Skills: { connect: manyIds(skills) },
        }),
        userId,
      },
    })
  }

  async update(
    userId: string,
    id: string,
    { skills, ...updateFormationDto }: UpdateFormationDto,
  ): CommonOutput<FormationDto> {
    return await this.repository.update({
      where: { id, userId },
      data: {
        ...updateFormationDto,
        ...(skills && {
          Skills: { set: [], connect: manyIds(skills) },
        }),
      },
    })
  }

  async addSkills(userId: string, id: string, skills: string[]): CommonOutput<FormationDto> {
    return await this.repository.update({
      where: { userId, id },
      include: { Skills: true },
      data: {
        Skills: { connect: manyIds(skills) },
      },
    })
  }

  async removeSkills(userId: string, id: string, skills: string[]): CommonOutput<FormationDto> {
    return await this.repository.update({
      where: { userId, id },
      include: { Skills: true },
      data: {
        Skills: { disconnect: manyIds(skills) },
      },
    })
  }

  async remove(userId: string, id: string): CommonOutput<FormationDto> {
    return await this.repository.delete({ where: { userId, id } })
  }
}
