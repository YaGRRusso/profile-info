import { ExperiencesController } from './experiences.controller'
import { ExperiencesService } from './experiences.service'

import { Module } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Module({
  controllers: [ExperiencesController],
  providers: [ExperiencesService, PrismaClient],
  exports: [ExperiencesService],
})
export class ExperiencesModule {}
