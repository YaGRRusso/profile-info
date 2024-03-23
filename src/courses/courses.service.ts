import { CourseDto } from './dto/course.dto'
import { CreateCourseDto } from './dto/create-course.dto'
import { SearchCourseDto } from './dto/search-course.dto'
import { UpdateCourseDto } from './dto/update-course.dto'
import { PrismaCoursesRepository } from './repositories/courses.repository.prisma'

import { manyIds } from '@helpers/prisma.helper'
import { Output } from '@interfaces/output.interface'

import { Injectable } from '@nestjs/common'

@Injectable()
export class CoursesService {
  constructor(private repository: PrismaCoursesRepository) {}

  findAll(userId: string): Output<CourseDto[]> {
    return this.repository.findAll({ where: { userId } })
  }

  findOne(userId: string, id: string): Output<CourseDto> {
    return this.repository.findOne({ where: { id, userId } })
  }

  searchAll(
    userId: string,
    searchCourseDto: SearchCourseDto,
  ): Output<CourseDto[]> {
    return this.repository.findAll({
      where: {
        ...searchCourseDto,
        ...(searchCourseDto.skills?.length && {
          Skills: { some: { id: searchCourseDto.skills[0] } },
        }),
        userId,
      },
    })
  }

  create(
    userId: string,
    { skills, ...createCourseDto }: CreateCourseDto,
  ): Output<CourseDto> {
    return this.repository.create({
      data: {
        userId,
        ...createCourseDto,
        ...(skills?.length && {
          Skills: { connect: manyIds(skills) },
        }),
      },
    })
  }

  update(
    userId: string,
    id: string,
    updateCourseDto: UpdateCourseDto,
  ): Output<CourseDto> {
    return this.repository.update({
      where: { id, userId },
      data: {
        ...updateCourseDto,
        ...(updateCourseDto.skills && {
          Skills: { set: [], connect: manyIds(updateCourseDto.skills) },
        }),
      },
    })
  }

  addSkills(userId: string, id: string, skills: string[]): Output<CourseDto> {
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
  ): Output<CourseDto> {
    return this.repository.update({
      where: { userId, id },
      include: { Skills: true },
      data: {
        Skills: { disconnect: manyIds(skills) },
      },
    })
  }

  remove(userId: string, id: string): Output<CourseDto> {
    return this.repository.remove({ where: { userId, id } })
  }
}
