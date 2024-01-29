import { Module } from '@nestjs/common'
import { ProjectsController } from './projects.controller'
import { ProjectsService } from './projects.service'
import { PrismaProjectsRepository } from './repositories/projects.repository.prisma'

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService, PrismaProjectsRepository],
  exports: [ProjectsService],
})
export class ProjectsModule {}
