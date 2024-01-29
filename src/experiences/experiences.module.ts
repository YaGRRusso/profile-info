import { Module } from '@nestjs/common'
import { ExperiencesController } from './experiences.controller'
import { ExperiencesService } from './experiences.service'
import { PrismaExperiencesRepository } from './repositories/experiences.repository.prisma'

@Module({
  controllers: [ExperiencesController],
  providers: [ExperiencesService, PrismaExperiencesRepository],
  exports: [ExperiencesService],
})
export class ExperiencesModule {}
