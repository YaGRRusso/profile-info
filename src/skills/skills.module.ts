import { PrismaSkillsRepository } from './repositories/skills.repository.prisma'
import { SkillsController } from './skills.controller'
import { SkillsService } from './skills.service'

import { Module } from '@nestjs/common'

@Module({
  controllers: [SkillsController],
  providers: [SkillsService, PrismaSkillsRepository],
  exports: [SkillsService],
})
export class SkillsModule {}
