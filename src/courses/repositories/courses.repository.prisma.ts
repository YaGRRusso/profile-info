import { CoursesRepositoryInterface } from './courses.repository.interface'

import { Course } from '../entities/course.entity'

import { PrismaService } from '@prisma/prisma.service'
import { PrismaCommonRepository } from '@repositories/common.repository.prisma'

import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'

@Injectable()
export class PrismaCoursesRepository
  extends PrismaCommonRepository<
    Course,
    Prisma.CourseFindManyArgs,
    Prisma.CourseFindUniqueArgs,
    Prisma.CourseCreateArgs,
    Prisma.CourseDeleteArgs,
    Prisma.CourseUpdateArgs
  >
  implements CoursesRepositoryInterface
{
  constructor(protected prisma: PrismaService) {
    super(prisma, 'Course')
  }
}
