import { ProjectsController } from './projects.controller'
import { ProjectsService } from './projects.service'
import { PrismaProjectsRepository } from './repositories/projects.repository.prisma'

import { Module } from '@nestjs/common'

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService, PrismaProjectsRepository],
  exports: [ProjectsService],
})
export class ProjectsModule {}
