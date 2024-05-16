import { ProjectsController } from './projects.controller'
import { ProjectsService } from './projects.service'

import { Module } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService, PrismaClient],
  exports: [ProjectsService],
})
export class ProjectsModule {}
