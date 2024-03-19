import { CreateProjectDto } from './dto/create-project.dto'
import { ProjectDto } from './dto/project.dto'
import { SearchProjectDto } from './dto/search-project.dto'
import { UpdateProjectDto } from './dto/update-project.dto'
import { PrismaProjectsRepository } from './repositories/projects.repository.prisma'

import { manyIds } from '@helpers/prisma.helper'
import { Output } from '@interfaces/output.interface'

import { Injectable } from '@nestjs/common'

@Injectable()
export class ProjectsService {
  constructor(private repository: PrismaProjectsRepository) {}

  findAll(): Output<ProjectDto[]> {
    return this.repository.findAll()
  }

  findOne(id: string): Output<ProjectDto> {
    return this.repository.findOne({ where: { id } })
  }

  searchAll(searchProjectDto: SearchProjectDto): Output<ProjectDto[]> {
    return this.repository.findAll({
      where: {
        ...searchProjectDto,
        ...(searchProjectDto.skills?.length && {
          Skills: { some: { id: searchProjectDto.skills[0] } },
        }),
      },
    })
  }

  create(
    userId: string,
    { skills, ...createProjectDto }: CreateProjectDto,
  ): Output<ProjectDto> {
    return this.repository.create({
      data: {
        userId,
        ...createProjectDto,
        ...(skills?.length && {
          Skills: { connect: manyIds(skills) },
        }),
      },
    })
  }

  update(
    userId: string,
    id: string,
    { skills, ...updateProjectDto }: UpdateProjectDto,
  ): Output<ProjectDto> {
    return this.repository.update({
      where: { id, userId },
      data: {
        ...updateProjectDto,
        ...(skills && {
          Skills: { set: [], connect: manyIds(skills) },
        }),
      },
    })
  }

  addSkills(userId: string, id: string, skills: string[]): Output<ProjectDto> {
    return this.repository.update({
      where: { userId, id },
      include: { Skills: true },
      data: {
        Skills: { connect: manyIds(skills) },
      },
    })
  }

  removeSkills(
    userId: string,
    id: string,
    skills: string[],
  ): Output<ProjectDto> {
    return this.repository.update({
      where: { userId, id },
      include: { Skills: true },
      data: {
        Skills: { disconnect: manyIds(skills) },
      },
    })
  }

  remove(userId: string, id: string): Output<ProjectDto> {
    return this.repository.remove({ where: { userId, id } })
  }
}
