import { CoursesController } from './courses.controller'
import { CoursesService } from './courses.service'
import { PrismaCoursesRepository } from './repositories/courses.repository.prisma'

import { Module } from '@nestjs/common'

@Module({
  controllers: [CoursesController],
  providers: [CoursesService, PrismaCoursesRepository],
  exports: [CoursesService],
})
export class CoursesModule {}
