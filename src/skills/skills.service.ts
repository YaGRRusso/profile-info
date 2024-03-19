import { CreateSkillDto } from './dto/create-skill.dto'
import { SearchSkillDto } from './dto/search-skill.dto'
import { SkillDto } from './dto/skill.dto'
import { UpdateSkillDto } from './dto/update-skill.dto'
import { PrismaSkillsRepository } from './repositories/skills.repository.prisma'

import { Output } from '@interfaces/output.interface'

import { Injectable } from '@nestjs/common'

@Injectable()
export class SkillsService {
  constructor(private repository: PrismaSkillsRepository) {}

  async findAll(): Output<SkillDto[]> {
    return await this.repository.findAll()
  }

  async findOne(id: string): Output<SkillDto> {
    return await this.repository.findOne({ where: { id } })
  }

  async searchAll(searchSkillDto: SearchSkillDto): Output<SkillDto[]> {
    return await this.repository.findAll({ where: { ...searchSkillDto } })
  }

  async create(createSkillDto: CreateSkillDto): Output<SkillDto> {
    return await this.repository.create({
      data: { ...createSkillDto },
    })
  }

  async update(id: string, updateSkillDto: UpdateSkillDto): Output<SkillDto> {
    return await this.repository.update({
      where: { id },
      data: { ...updateSkillDto },
    })
  }

  async remove(id: string): Output<SkillDto> {
    return await this.repository.remove({ where: { id } })
  }
}
