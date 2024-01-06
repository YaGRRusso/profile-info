import { Injectable } from '@nestjs/common'
import { PrismaProjectsRepository } from './repositories/projects.repository.prisma'
import { Project } from './entities/project.entity'
import { Output } from '@interfaces/output.interface'
import { connectMany } from '@helpers/prisma.helper'

@Injectable()
export class ProjectsService {
  constructor(private repository: PrismaProjectsRepository) {}

  create({ skills, ...createProjectDto }: Partial<Project>): Output<Project> {
    return this.repository.create({
      ...createProjectDto,
      Skill: connectMany(skills),
    })
  }

  findAll(): Output<Project[]> {
    return this.repository.findAll()
  }

  searchAll(searchProjectDto: Partial<Project>): Output<Project[]> {
    return this.repository.searchAll(searchProjectDto)
  }

  findOne(id: string): Output<Project> {
    return this.repository.findOne(id)
  }

  update(id: string, updateProjectDto: Partial<Project>): Output<Project> {
    return this.repository.update(id, updateProjectDto)
  }

  remove(id: string): Output<Project> {
    return this.repository.remove(id)
  }
}
