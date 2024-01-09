import { Injectable } from '@nestjs/common'
import { PrismaProjectsRepository } from './repositories/projects.repository.prisma'
import { Project } from './entities/project.entity'
import { Output } from '@interfaces/output.interface'
import { manyIds } from '@helpers/prisma.helper'

@Injectable()
export class ProjectsService {
  constructor(private repository: PrismaProjectsRepository) {}

  create(createProjectDto: Partial<Project>): Output<Project> {
    return this.repository.create({
      data: {
        ...(createProjectDto as Project),
        skills: { connect: manyIds(createProjectDto.skills) },
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
        ...(searchProjectDto.skills?.length && {
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
        ...(updateProjectDto.skills && {
          skills: { set: [], connect: manyIds(updateProjectDto.skills) },
        }),
      },
    })
  }

  addSkills(id: string, skills: Project['skills']): Output<Project> {
    return this.repository.update({
      where: { id },
      data: {
        skills: { connect: manyIds(skills) },
      },
    })
  }

  removeSkills(id: string, skills: Project['skills']): Output<Project> {
    return this.repository.update({
      where: { id },
      data: {
        skills: { disconnect: manyIds(skills) },
      },
    })
  }

  remove(id: string): Output<Project> {
    return this.repository.remove({ where: { id } })
  }
}
