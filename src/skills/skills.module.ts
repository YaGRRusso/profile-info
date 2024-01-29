import { Module } from '@nestjs/common'
import { PrismaSkillsRepository } from './repositories/skills.repository.prisma'
import { SkillsController } from './skills.controller'
import { SkillsService } from './skills.service'

@Module({
  controllers: [SkillsController],
  providers: [SkillsService, PrismaSkillsRepository],
  exports: [SkillsService],
})
export class SkillsModule {}
