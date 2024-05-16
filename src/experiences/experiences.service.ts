import { CreateExperienceDto } from './dto/create-experience.dto'
import { ExperienceDto } from './dto/experience.dto'
import { SearchExperienceDto } from './dto/search-experience.dto'
import { UpdateExperienceDto } from './dto/update-experience.dto'

import { manyIds } from '@/common/helpers/prisma.helper'
import { Output } from '@/common/interfaces/output.interface'

import { Injectable } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class ExperiencesService {
  constructor(private prisma: PrismaClient) {}
  private repository = this.prisma.experience

  async findAll(userId: string): Output<ExperienceDto[]> {
    const res = await this.repository.findMany({
      where: { userId },
      include: { Skills: { select: { id: true } } },
    })

    return res.map(({ Skills, ...experience }) => ({
      ...experience,
      skills: Skills.map((skill) => skill.id),
    }))
  }

  async findOne(userId: string, id: string): Output<ExperienceDto> {
    return await this.repository.findUnique({ where: { id, userId } })
  }

  async searchAll(
    userId: string,
    searchExperienceDto: SearchExperienceDto,
  ): Output<ExperienceDto[]> {
    return await this.repository.findMany({
      where: {
        ...searchExperienceDto,
        ...(searchExperienceDto.skills?.length && {
          Skills: { some: { id: searchExperienceDto.skills[0] } },
        }),
        userId,
      },
    })
  }

  async create(
    userId: string,
    { skills, ...createExperienceDto }: CreateExperienceDto,
  ): Output<ExperienceDto> {
    return await this.repository.create({
      data: {
        ...createExperienceDto,
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
    { skills, ...updateExperienceDto }: UpdateExperienceDto,
  ): Output<ExperienceDto> {
    return await this.repository.update({
      where: { id, userId },
      data: {
        ...updateExperienceDto,
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
  ): Output<ExperienceDto> {
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
  ): Output<ExperienceDto> {
    return await this.repository.update({
      where: { userId, id },
      include: { Skills: true },
      data: {
        Skills: { disconnect: manyIds(skills) },
      },
    })
  }

  async remove(userId: string, id: string): Output<ExperienceDto> {
    return await this.repository.delete({ where: { userId, id } })
  }
}
