import { SkillsController } from './skills.controller'
import { SkillsService } from './skills.service'

import { Module } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Module({
  controllers: [SkillsController],
  providers: [SkillsService, PrismaClient],
  exports: [SkillsService],
})
export class SkillsModule {}
