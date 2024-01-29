import { manyIds } from '@helpers/prisma.helper'
import { Output } from '@interfaces/output.interface'
import { Injectable } from '@nestjs/common'
import { CreateProjectDto } from './dto/create-project.dto'
import { SearchProjectDto } from './dto/search-project.dto'
import { UpdateProjectDto } from './dto/update-project.dto'
import { Project } from './entities/project.entity'
import { PrismaProjectsRepository } from './repositories/projects.repository.prisma'

@Injectable()
export class ProjectsService {
  constructor(private repository: PrismaProjectsRepository) {}

  findAll(): Output<Project[]> {
    return this.repository.findAll()
  }

  findOne(id: string): Output<Project> {
    return this.repository.findOne({ where: { id } })
  }

  searchAll(searchProjectDto: SearchProjectDto): Output<Project[]> {
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
  ): Output<Project> {
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
  ): Output<Project> {
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

  addSkills(userId: string, id: string, skills: string[]): Output<Project> {
    return this.repository.update({
      where: { userId, id },
      include: { Skills: true },
      data: {
        Skills: { connect: manyIds(skills) },
      },
    })
  }

  removeSkills(userId: string, id: string, skills: string[]): Output<Project> {
    return this.repository.update({
      where: { userId, id },
      include: { Skills: true },
      data: {
        Skills: { disconnect: manyIds(skills) },
      },
    })
  }

  remove(userId: string, id: string): Output<Project> {
    return this.repository.remove({ where: { userId, id } })
  }
}
