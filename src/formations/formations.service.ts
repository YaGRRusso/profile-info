import { CreateFormationDto } from './dto/create-formation.dto'
import { FormationDto } from './dto/formation.dto'
import { SearchFormationDto } from './dto/search-formation.dto'
import { UpdateFormationDto } from './dto/update-formation.dto'

import { manyIds } from '@/common/helpers/prisma.helper'
import { CommonOutput } from '@/common/interfaces/output.interface'

import { Injectable } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class FormationsService {
  constructor(private prisma: PrismaClient) {}
  private repository = this.prisma.formation

  async findAll(userId: string): CommonOutput<FormationDto[]> {
    const res = await this.repository.findMany({
      where: { userId },
      include: { Skills: { select: { id: true } } },
    })

    return res.map(({ Skills, ...formation }) => ({
      ...formation,
      skills: Skills.map((skill) => skill.id),
    }))
  }

  async findOne(userId: string, id: string): CommonOutput<FormationDto> {
    return await this.repository.findUnique({ where: { id, userId } })
  }

  async searchAll(
    userId: string,
    searchFormationDto: SearchFormationDto,
  ): CommonOutput<FormationDto[]> {
    return await this.repository.findMany({
      where: {
        ...searchFormationDto,
        ...(searchFormationDto.skills?.length && {
          Skills: { some: { id: { in: searchFormationDto.skills } } },
        }),
        userId,
      },
    })
  }

  async create(
    userId: string,
    { skills, ...createFormationDto }: CreateFormationDto,
  ): CommonOutput<FormationDto> {
    return await this.repository.create({
      data: {
        ...createFormationDto,
        ...(skills?.length && {
          Skills: { connect: manyIds(skills) },
        }),
        userId,
      },
    })
  }

  async update(
    userId: string,
    id: string,
    { skills, ...updateFormationDto }: UpdateFormationDto,
  ): CommonOutput<FormationDto> {
    return await this.repository.update({
      where: { id, userId },
      data: {
        ...updateFormationDto,
        ...(skills && {
          Skills: { set: [], connect: manyIds(skills) },
        }),
      },
    })
  }

  async addSkills(
    userId: string,
    id: string,
    skills: string[],
  ): CommonOutput<FormationDto> {
    return await this.repository.update({
      where: { userId, id },
      include: { Skills: true },
      data: {
        Skills: { connect: manyIds(skills) },
      },
    })
  }

  async removeSkills(
    userId: string,
    id: string,
    skills: string[],
  ): CommonOutput<FormationDto> {
    return await this.repository.update({
      where: { userId, id },
      include: { Skills: true },
      data: {
        Skills: { disconnect: manyIds(skills) },
      },
    })
  }

  async remove(userId: string, id: string): CommonOutput<FormationDto> {
    return await this.repository.delete({ where: { userId, id } })
  }
}
