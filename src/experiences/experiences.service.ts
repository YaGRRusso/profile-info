import { CreateExperienceDto } from './dto/create-experience.dto'
import { ExperienceDto } from './dto/experience.dto'
import { SearchExperienceDto } from './dto/search-experience.dto'
import { UpdateExperienceDto } from './dto/update-experience.dto'
import { PrismaExperiencesRepository } from './repositories/experiences.repository.prisma'

import { manyIds } from '@helpers/prisma.helper'
import { Output } from '@interfaces/output.interface'

import { Injectable } from '@nestjs/common'

@Injectable()
export class ExperiencesService {
  constructor(private repository: PrismaExperiencesRepository) {}

  findAll(userId: string): Output<ExperienceDto[]> {
    return this.repository.findAll({ where: { userId } })
  }

  findOne(userId: string, id: string): Output<ExperienceDto> {
    return this.repository.findOne({ where: { id, userId } })
  }

  searchAll(
    userId: string,
    searchExperienceDto: SearchExperienceDto,
  ): Output<ExperienceDto[]> {
    return this.repository.findAll({
      where: {
        ...searchExperienceDto,
        ...(searchExperienceDto.skills?.length && {
          Skills: { some: { id: searchExperienceDto.skills[0] } },
        }),
        userId,
      },
    })
  }

  create(
    userId: string,
    { skills, ...createExperienceDto }: CreateExperienceDto,
  ): Output<ExperienceDto> {
    return this.repository.create({
      data: {
        userId,
        ...createExperienceDto,
        ...(skills?.length && {
          Skills: { connect: manyIds(skills) },
        }),
      },
    })
  }

  update(
    userId: string,
    id: string,
    updateExperienceDto: UpdateExperienceDto,
  ): Output<ExperienceDto> {
    return this.repository.update({
      where: { id, userId },
      data: {
        ...updateExperienceDto,
        ...(updateExperienceDto.skills && {
          Skills: { set: [], connect: manyIds(updateExperienceDto.skills) },
        }),
      },
    })
  }

  addSkills(
    userId: string,
    id: string,
    skills: string[],
  ): Output<ExperienceDto> {
    return this.repository.update({
      where: { userId, id },
      include: { Skills: true },
      data: {
        Skills: { connect: manyIds(skills) },
      },
    })
  }

  removeSkills(
    userId: string,
    id: string,
    skills: string[],
  ): Output<ExperienceDto> {
    return this.repository.update({
      where: { userId, id },
      include: { Skills: true },
      data: {
        Skills: { disconnect: manyIds(skills) },
      },
    })
  }

  remove(userId: string, id: string): Output<ExperienceDto> {
    return this.repository.remove({ where: { userId, id } })
  }
}
