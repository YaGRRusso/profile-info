import { CourseDto } from './dto/course.dto'
import { CreateCourseDto } from './dto/create-course.dto'
import { SearchCourseDto } from './dto/search-course.dto'
import { UpdateCourseDto } from './dto/update-course.dto'

import { manyIds } from '@/common/helpers/prisma.helper'
import { Output } from '@/common/interfaces/output.interface'

import { Injectable } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaClient) {}
  private repository = this.prisma.course

  async findAll(userId: string): Output<CourseDto[]> {
    const res = await this.repository.findMany({
      where: { userId },
      include: { Skills: { select: { id: true } } },
    })

    return res.map(({ Skills, ...course }) => ({
      ...course,
      skills: Skills.map((skill) => skill.id),
    }))
  }

  async findOne(userId: string, id: string): Output<CourseDto> {
    return await this.repository.findUnique({ where: { id, userId } })
  }

  async searchAll(
    userId: string,
    searchCourseDto: SearchCourseDto,
  ): Output<CourseDto[]> {
    return await this.repository.findMany({
      where: {
        ...searchCourseDto,
        ...(searchCourseDto.skills?.length && {
          Skills: { some: { id: searchCourseDto.skills[0] } },
        }),
        userId,
      },
    })
  }

  async create(
    userId: string,
    { skills, ...createCourseDto }: CreateCourseDto,
  ): Output<CourseDto> {
    return await this.repository.create({
      data: {
        ...createCourseDto,
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
    { skills, ...updateCourseDto }: UpdateCourseDto,
  ): Output<CourseDto> {
    return await this.repository.update({
      where: { id, userId },
      data: {
        ...updateCourseDto,
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
  ): Output<CourseDto> {
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
  ): Output<CourseDto> {
    return await this.repository.update({
      where: { userId, id },
      include: { Skills: true },
      data: {
        Skills: { disconnect: manyIds(skills) },
      },
    })
  }

  async remove(userId: string, id: string): Output<CourseDto> {
    return await this.repository.delete({ where: { userId, id } })
  }
}
