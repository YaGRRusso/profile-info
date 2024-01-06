import { Injectable } from '@nestjs/common'
import { PrismaSkillsRepository } from './repositories/skills.repository.prisma'
import { Skill } from './entities/skill.entity'
import { Output } from '@interfaces/output.interface'

@Injectable()
export class SkillsService {
  constructor(private repository: PrismaSkillsRepository) {}

  async findAll(): Output<Skill[]> {
    return await this.repository.findAll()
  }

  async findOne(id: string): Output<Skill> {
    return await this.repository.findOne(id)
  }

  async searchAll(search: Partial<Skill>): Output<Skill[]> {
    return await this.repository.searchAll(search)
  }

  async create(data: Partial<Skill>): Output<Skill> {
    return await this.repository.create(data)
  }

  async update(id: string, data: Partial<Skill>): Output<Skill> {
    return await this.repository.update(id, data)
  }

  async remove(id: string): Output<Skill> {
    return await this.repository.remove(id)
  }
}
