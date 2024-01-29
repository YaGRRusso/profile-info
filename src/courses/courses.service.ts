import { manyIds } from '@helpers/prisma.helper'
import { Output } from '@interfaces/output.interface'
import { Injectable } from '@nestjs/common'
import { CreateCourseDto } from './dto/create-course.dto'
import { SearchCourseDto } from './dto/search-course.dto'
import { UpdateCourseDto } from './dto/update-course.dto'
import { Course } from './entities/course.entity'
import { PrismaCoursesRepository } from './repositories/courses.repository.prisma'

@Injectable()
export class CoursesService {
  constructor(private repository: PrismaCoursesRepository) {}

  findAll(): Output<Course[]> {
    return this.repository.findAll()
  }

  findOne(id: string): Output<Course> {
    return this.repository.findOne({ where: { id } })
  }

  searchAll(searchCourseDto: SearchCourseDto): Output<Course[]> {
    return this.repository.findAll({
      where: {
        ...searchCourseDto,
        ...(searchCourseDto.skills?.length && {
          Skills: { some: { id: searchCourseDto.skills[0] } },
        }),
      },
    })
  }

  create(
    userId: string,
    { skills, ...createCourseDto }: CreateCourseDto,
  ): Output<Course> {
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
  ): Output<Course> {
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

  addSkills(userId: string, id: string, skills: string[]): Output<Course> {
    return this.repository.update({
      where: { userId, id },
      include: { Skills: true },
      data: {
        Skills: { connect: manyIds(skills) },
      },
    })
  }

  removeSkills(userId: string, id: string, skills: string[]): Output<Course> {
    return this.repository.update({
      where: { userId, id },
      include: { Skills: true },
      data: {
        Skills: { disconnect: manyIds(skills) },
      },
    })
  }

  remove(userId: string, id: string): Output<Course> {
    return this.repository.remove({ where: { userId, id } })
  }
}
