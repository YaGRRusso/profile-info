import { Prisma, Course } from '@prisma/client'
import { CommonRepositoryInterface } from '@repositories/common.repository.interface'

export interface CoursesRepositoryInterface
  extends CommonRepositoryInterface<
    Course,
    Prisma.CourseFindManyArgs,
    Prisma.CourseFindUniqueArgs,
    Prisma.CourseCreateArgs,
    Prisma.CourseDeleteArgs,
    Prisma.CourseUpdateArgs
  > {}
