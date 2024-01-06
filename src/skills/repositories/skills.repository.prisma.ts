import { Injectable } from '@nestjs/common'
import { SkillsRepositoryInterface } from './skills.repository.interface'
import { Skill } from '../entities/skill.entity'
import { PrismaService } from '@prisma/prisma.service'
import { PrismaCommonRepository } from '@repositories/common.repository.prisma'

@Injectable()
export class PrismaSkillsRepository
  extends PrismaCommonRepository<Skill>
  implements SkillsRepositoryInterface
{
  constructor(protected prisma: PrismaService) {
    super(prisma, Skill)
  }
}
