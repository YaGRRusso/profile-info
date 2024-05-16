import { CreateProjectDto } from './dto/create-project.dto'
import { ProjectDto } from './dto/project.dto'
import { SearchProjectDto } from './dto/search-project.dto'
import { UpdateProjectDto } from './dto/update-project.dto'

import { manyIds } from '@/common/helpers/prisma.helper'
import { Output } from '@/common/interfaces/output.interface'

import { Injectable } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaClient) {}
  private repository = this.prisma.project

  async findAll(userId: string): Output<ProjectDto[]> {
    const res = await this.repository.findMany({
      where: { userId },
      include: { Skills: { select: { id: true } } },
    })

    return res.map(({ Skills, ...project }) => ({
      ...project,
      skills: Skills.map((skill) => skill.id),
    }))
  }

  async findOne(userId: string, id: string): Output<ProjectDto> {
    return await this.repository.findUnique({ where: { id, userId } })
  }

  async searchAll(
    userId: string,
    searchProjectDto: SearchProjectDto,
  ): Output<ProjectDto[]> {
    return await this.repository.findMany({
      where: {
        ...searchProjectDto,
        ...(searchProjectDto.skills?.length && {
          Skills: { some: { id: searchProjectDto.skills[0] } },
        }),
        userId,
      },
    })
  }

  async create(
    userId: string,
    { skills, ...createProjectDto }: CreateProjectDto,
  ): Output<ProjectDto> {
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
  ): Output<ProjectDto> {
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
  ): Output<ProjectDto> {
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
  ): Output<ProjectDto> {
    return await this.repository.update({
      where: { userId, id },
      include: { Skills: true },
      data: {
        Skills: { disconnect: manyIds(skills) },
      },
    })
  }

  async remove(userId: string, id: string): Output<ProjectDto> {
    return await this.repository.delete({ where: { userId, id } })
  }
}
