import { Module } from '@nestjs/common'
import { SkillsService } from './skills.service'
import { SkillsController } from './skills.controller'
import { PrismaSkillsRepository } from './repositories/skills.repository.prisma'

@Module({
  controllers: [SkillsController],
  providers: [SkillsService, PrismaSkillsRepository],
  exports: [SkillsService],
})
export class SkillsModule {}
