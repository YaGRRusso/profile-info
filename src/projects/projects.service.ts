import { CreateProjectDto } from './dto/create-project.dto'
import { ProjectDto } from './dto/project.dto'
import { SearchProjectDto } from './dto/search-project.dto'
import { UpdateProjectDto } from './dto/update-project.dto'

import { manyIds } from '@/common/helpers/prisma.helper'
import { CommonOutput } from '@/common/interfaces/output.interface'

import { Injectable } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaClient) {}
  private repository = this.prisma.project

  async findAll(userId: string): CommonOutput<ProjectDto[]> {
    const res = await this.repository.findMany({
      where: { userId },
      include: { Skills: { select: { id: true } } },
    })

    return res.map(({ Skills, ...project }) => ({
      ...project,
      skills: Skills.map((skill) => skill.id),
    }))
  }

  async findOne(userId: string, id: string): CommonOutput<ProjectDto> {
    return await this.repository.findUnique({ where: { id, userId } })
  }

  async searchAll(
    userId: string,
    searchProjectDto: SearchProjectDto,
  ): CommonOutput<ProjectDto[]> {
    return await this.repository.findMany({
      where: {
        ...searchProjectDto,
        ...(searchProjectDto.skills?.length && {
          Skills: { some: { id: { in: searchProjectDto.skills } } },
        }),
        userId,
      },
    })
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

  async addSkills(
    userId: string,
    id: string,
    skills: string[],
  ): CommonOutput<ProjectDto> {
    return await this.repository.update({
      where: { userId, id },
      include: { Skills: true },
      data: {
        Skills: { connect: manyIds(skills) },
      },
    })
  }

  async removeSkills(
    userId: string,
    id: string,
    skills: string[],
  ): CommonOutput<ProjectDto> {
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
