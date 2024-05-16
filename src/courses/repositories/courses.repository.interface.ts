import { CommonRepositoryInterface } from '@/common/repositories/common.repository.interface'

import { Course, Prisma } from '@prisma/client'

export interface CoursesRepositoryInterface
  extends CommonRepositoryInterface<
    Course,
    Prisma.CourseFindManyArgs,
    Prisma.CourseFindUniqueArgs,
    Prisma.CourseCreateArgs,
    Prisma.CourseDeleteArgs,
    Prisma.CourseUpdateArgs
  > {}
