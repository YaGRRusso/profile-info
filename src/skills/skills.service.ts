import { CreateSkillDto } from './dto/create-skill.dto'
import { SearchSkillDto } from './dto/search-skill.dto'
import { SkillDto } from './dto/skill.dto'
import { UpdateSkillDto } from './dto/update-skill.dto'

import { CommonOutput } from '@/common/interfaces/output.interface'

import { Injectable } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class SkillsService {
  constructor(private prisma: PrismaClient) {}
  private repository = this.prisma.skill

  async findAll(userId: string): CommonOutput<SkillDto[]> {
    return await this.repository.findMany({ where: { userId } })
  }

  async findOne(userId: string, id: string): CommonOutput<SkillDto> {
    return await this.repository.findUnique({ where: { id, userId } })
  }

  async searchAll(
    userId: string,
    searchSkillDto: SearchSkillDto,
  ): CommonOutput<SkillDto[]> {
    return await this.repository.findMany({
      where: { ...searchSkillDto, userId },
    })
  }

  async create(
    userId: string,
    createSkillDto: CreateSkillDto,
  ): CommonOutput<SkillDto> {
    return await this.repository.create({
      data: { ...createSkillDto, userId },
    })
  }

  async update(
    userId: string,
    id: string,
    updateSkillDto: UpdateSkillDto,
  ): CommonOutput<SkillDto> {
    return await this.repository.update({
      where: { id, userId },
      data: { ...updateSkillDto },
    })
  }

  async remove(userId: string, id: string): CommonOutput<SkillDto> {
    return await this.repository.delete({ where: { id, userId } })
  }
}
