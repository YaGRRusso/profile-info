import { CoursesController } from './courses.controller'
import { CoursesService } from './courses.service'

import { Module } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Module({
  controllers: [CoursesController],
  providers: [CoursesService, PrismaClient],
  exports: [CoursesService],
})
export class CoursesModule {}
