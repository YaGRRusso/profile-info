import { Injectable } from '@nestjs/common'
import { Prisma, Skill } from '@prisma/client'
import { PrismaService } from '@prisma/prisma.service'
import { PrismaCommonRepository } from '@repositories/common.repository.prisma'
import { SkillsRepositoryInterface } from './skills.repository.interface'

@Injectable()
export class PrismaSkillsRepository
  extends PrismaCommonRepository<
    Skill,
    Prisma.SkillFindManyArgs,
    Prisma.SkillFindUniqueArgs,
    Prisma.SkillCreateArgs,
    Prisma.SkillDeleteArgs,
    Prisma.SkillUpdateArgs
  >
  implements SkillsRepositoryInterface
{
  constructor(protected prisma: PrismaService) {
    super(prisma, 'Skill')
  }
}
