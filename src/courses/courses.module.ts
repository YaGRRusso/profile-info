import { Module } from '@nestjs/common'
import { CoursesController } from './courses.controller'
import { CoursesService } from './courses.service'
import { PrismaCoursesRepository } from './repositories/courses.repository.prisma'

@Module({
  controllers: [CoursesController],
  providers: [CoursesService, PrismaCoursesRepository],
  exports: [CoursesService],
})
export class CoursesModule {}
