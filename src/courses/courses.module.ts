import { Module } from '@nestjs/common'
import { CoursesService } from './courses.service'
import { CoursesController } from './courses.controller'
import { PrismaCoursesRepository } from './repositories/courses.repository.prisma'

@Module({
  controllers: [CoursesController],
  providers: [CoursesService, PrismaCoursesRepository],
  exports: [CoursesService],
})
export class CoursesModule {}
