import { Injectable } from '@nestjs/common'
import { PrismaProjectsRepository } from './repositories/projects.repository.prisma'
import { Project } from './entities/project.entity'
import { Output } from '@interfaces/output.interface'
import { manyIds } from '@helpers/prisma.helper'
import { CreateProjectDto } from './dto/create-project.dto'
import { SearchProjectDto } from './dto/search-project.dto'
import { UpdateProjectDto } from './dto/update-project.dto'

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
          skills: { some: { id: searchProjectDto.skills[0] } },
        }),
      },
    })
  }

  create(userId: string, createProjectDto: CreateProjectDto): Output<Project> {
    return this.repository.create({
      data: {
        userId,
        ...createProjectDto,
        skills: { connect: manyIds(createProjectDto.skills) },
      },
    })
  }

  update(
    userId: string,
    id: string,
    updateProjectDto: UpdateProjectDto,
  ): Output<Project> {
    return this.repository.update({
      where: { id, userId },
      data: {
        ...updateProjectDto,
        ...(updateProjectDto.skills && {
          skills: { set: [], connect: manyIds(updateProjectDto.skills) },
        }),
      },
    })
  }

  addSkills(userId: string, id: string, skills: string[]): Output<Project> {
    return this.repository.update({
      where: { userId, id },
      include: { skills: true },
      data: {
        skills: { connect: manyIds(skills) },
      },
    })
  }

  removeSkills(userId: string, id: string, skills: string[]): Output<Project> {
    return this.repository.update({
      where: { userId, id },
      include: { skills: true },
      data: {
        skills: { disconnect: manyIds(skills) },
      },
    })
  }

  remove(userId: string, id: string): Output<Project> {
    return this.repository.remove({ where: { userId, id } })
  }
}
