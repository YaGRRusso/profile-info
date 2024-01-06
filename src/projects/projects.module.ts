import { Module } from '@nestjs/common'
import { ProjectsService } from './projects.service'
import { ProjectsController } from './projects.controller'
import { PrismaProjectsRepository } from './repositories/projects.repository.prisma'

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService, PrismaProjectsRepository],
  exports: [ProjectsService],
})
export class ProjectsModule {}
