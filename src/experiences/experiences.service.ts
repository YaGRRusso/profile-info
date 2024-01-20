import { Injectable } from '@nestjs/common'
import { PrismaExperiencesRepository } from './repositories/experiences.repository.prisma'
import { Experience } from './entities/experience.entity'
import { Output } from '@interfaces/output.interface'
import { manyIds } from '@helpers/prisma.helper'
import { CreateExperienceDto } from './dto/create-experience.dto'
import { SearchExperienceDto } from './dto/search-experience.dto'
import { UpdateExperienceDto } from './dto/update-experience.dto'

@Injectable()
export class ExperiencesService {
  constructor(private repository: PrismaExperiencesRepository) {}

  findAll(): Output<Experience[]> {
    return this.repository.findAll()
  }

  findOne(id: string): Output<Experience> {
    return this.repository.findOne({ where: { id } })
  }

  searchAll(searchExperienceDto: SearchExperienceDto): Output<Experience[]> {
    return this.repository.findAll({
      where: {
        ...searchExperienceDto,
        ...(searchExperienceDto.skills?.length && {
          Skills: { some: { id: searchExperienceDto.skills[0] } },
        }),
      },
    })
  }

  create(
    userId: string,
    { skills, ...createExperienceDto }: CreateExperienceDto,
  ): Output<Experience> {
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
  ): Output<Experience> {
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

  addSkills(userId: string, id: string, skills: string[]): Output<Experience> {
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
  ): Output<Experience> {
    return this.repository.update({
      where: { userId, id },
      include: { Skills: true },
      data: {
        Skills: { disconnect: manyIds(skills) },
      },
    })
  }

  remove(userId: string, id: string): Output<Experience> {
    return this.repository.remove({ where: { userId, id } })
  }
}
