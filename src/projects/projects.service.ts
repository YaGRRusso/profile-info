import { CreateProjectDto } from './dto/create-project.dto'
import { ProjectDto } from './dto/project.dto'
import { SearchProjectDto } from './dto/search-project.dto'
import { UpdateProjectDto } from './dto/update-project.dto'

import { prismaConfig } from '@/common/configs/prisma.config'
import { PaginationDto } from '@/common/dto/input.dto'
import { getPages, getPagination } from '@/common/helpers/pagination.helper'
import { manyIds } from '@/common/helpers/prisma.helper'
import { CommonOutput, PaginatedOutput } from '@/common/interfaces/output.interface'

import { Injectable } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaClient) {}
  public repository = this.prisma.$extends(prismaConfig).project

  async findAll(userId: string, { limit, page }: PaginationDto): PaginatedOutput<ProjectDto> {
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

  async findOne(userId: string, id: string): CommonOutput<ProjectDto> {
    return await this.repository.findUnique({ where: { id, userId } })
  }

  async searchAll(
    userId: string,
    searchCourseDto: SearchProjectDto,
    { limit, page }: PaginationDto,
  ): PaginatedOutput<ProjectDto> {
    const { skip, take } = getPages({ page, limit })

    const [records, count] = await this.repository.findManyAndCount({
      skip,
      take,
      include: { Skills: { select: { id: true } } },
      where: {
        ...searchCourseDto,
        ...(searchCourseDto.skills?.length && {
          Skills: { some: { id: { in: searchCourseDto.skills } } },
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
    { skills, ...createProjectDto }: CreateProjectDto,
  ): CommonOutput<ProjectDto> {
    return await this.repository.create({
      data: {
        ...createProjectDto,
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
    { skills, ...updateProjectDto }: UpdateProjectDto,
  ): CommonOutput<ProjectDto> {
    return await this.repository.update({
      where: { id, userId },
      data: {
        ...updateProjectDto,
        ...(skills && {
          Skills: { set: [], connect: manyIds(skills) },
        }),
      },
    })
  }

  async addSkills(userId: string, id: string, skills: string[]): CommonOutput<ProjectDto> {
    return await this.repository.update({
      where: { userId, id },
      include: { Skills: true },
      data: {
        Skills: { connect: manyIds(skills) },
      },
    })
  }

  async removeSkills(userId: string, id: string, skills: string[]): CommonOutput<ProjectDto> {
    return await this.repository.update({
      where: { userId, id },
      include: { Skills: true },
      data: {
        Skills: { disconnect: manyIds(skills) },
      },
    })
  }

  async remove(userId: string, id: string): CommonOutput<ProjectDto> {
    return await this.repository.delete({ where: { userId, id } })
  }
}
