import { Injectable } from '@nestjs/common'
import { PrismaProjectsRepository } from './repositories/projects.repository.prisma'
import { Project } from './entities/project.entity'
import { Output } from '@interfaces/output.interface'
import { connectMany } from '@helpers/prisma.helper'
import { MapperService } from '@mappers/mapper.service'

@Injectable()
export class ProjectsService {
  private readonly mapper: MapperService = new MapperService()
  constructor(private repository: PrismaProjectsRepository) {}

  create(createProjectDto: Partial<Project>): Output<Project> {
    const payload = this.mapper.toInstance(createProjectDto, Project)
    return this.repository.create({
      data: {
        ...payload,
        skills: connectMany(createProjectDto.skills),
      },
      include: { skills: true },
    })
  }

  findAll(): Output<Project[]> {
    return this.repository.findAll({ include: { skills: true } })
  }

  searchAll(searchProjectDto: Partial<Project>): Output<Project[]> {
    return this.repository.findAll({
      where: {
        ...searchProjectDto,
        ...(searchProjectDto.skills.length && {
          skills: { some: { id: searchProjectDto.skills[0] } },
        }),
      },
    })
  }

  findOne(id: string): Output<Project> {
    return this.repository.findOne({ where: { id } })
  }

  update(id: string, updateProjectDto: Partial<Project>): Output<Project> {
    return this.repository.update({
      where: { id },
      data: {
        ...updateProjectDto,
        ...(updateProjectDto.skills.length && {
          skills: connectMany(updateProjectDto.skills),
        }),
      },
    })
  }

  remove(id: string): Output<Project> {
    return this.repository.remove({ where: { id } })
  }
}
