import { SearchSkillDto } from './dto/search-skill.dto'
import { Injectable } from '@nestjs/common'
import { PrismaSkillsRepository } from './repositories/skills.repository.prisma'
import { Skill } from './entities/skill.entity'
import { Output } from '@interfaces/output.interface'
import { MapperService } from '@mappers/mapper.service'

@Injectable()
export class SkillsService {
  private readonly mapper: MapperService = new MapperService()

  constructor(private repository: PrismaSkillsRepository) {}

  async findAll(): Output<Skill[]> {
    return await this.repository.findAll()
  }

  async findOne(id: string): Output<Skill> {
    return await this.repository.findOne({ where: { id } })
  }

  async searchAll(searchSkillDto: SearchSkillDto): Output<Skill[]> {
    return await this.repository.findAll({ where: { ...searchSkillDto } })
  }

  async create(createSkillDto: Partial<Skill>): Output<Skill> {
    const payload = this.mapper.toInstance(createSkillDto, Skill)
    if (payload.level === '')
      return await this.repository.create({ data: { ...payload } })
  }

  async update(id: string, updateSkillDto: Partial<Skill>): Output<Skill> {
    return await this.repository.update({
      where: { id },
      data: { ...updateSkillDto },
    })
  }

  async remove(id: string): Output<Skill> {
    return await this.repository.remove({ where: { id } })
  }
}
