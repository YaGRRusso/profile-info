import { CourseDto } from './dto/course.dto'
import { CreateCourseDto } from './dto/create-course.dto'
import { SearchCourseDto } from './dto/search-course.dto'
import { UpdateCourseDto } from './dto/update-course.dto'

import { manyIds } from '@/common/helpers/prisma.helper'
import { Output } from '@/common/interfaces/output.interface'

import { Injectable } from '@nestjs/common'
import { Prisma, PrismaClient } from '@prisma/client'

const getPagination = (page: number, count: number, limit: number) => {
  const totalPages = Math.ceil(count / limit)
  return {
    totalRecords: count,
    currentPage: page,
    perPage: limit,
    totalPages,
    nextPage: page < totalPages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null,
  }
}

@Injectable()
export class CoursesService {
  private limit: number = 10

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
    page: number = 1,
  ): Output<CourseDto[]> {
    const skip = (page - 1) * this.limit

    const where: Prisma.CourseWhereInput = {
      ...searchCourseDto,
      ...(searchCourseDto.skills?.length && {
        Skills: { some: { id: { in: searchCourseDto.skills } } },
      }),
      userId,
    }

    const [count, records] = await this.prisma.$transaction([
      this.repository.count({ where }),
      this.repository.findMany({
        where,
        skip,
        take: this.limit,
        include: { Skills: { select: { id: true } } },
      }),
    ])

    const pagination = getPagination(page, count, this.limit)
    const data = records.map(({ Skills, ...course }) => ({
      ...course,
      skills: Skills.map((skill) => skill.id),
    }))

    // @ts-expect-error testing
    return { data, pagination }
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
