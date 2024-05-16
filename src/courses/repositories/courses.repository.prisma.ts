import { CoursesRepositoryInterface } from './courses.repository.interface'

import { PrismaService } from '@/common/prisma/prisma.service'
import { PrismaCommonRepository } from '@/common/repositories/common.repository.prisma'

import { Injectable } from '@nestjs/common'
import { Course, Prisma } from '@prisma/client'

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
