import { SkillsRepositoryInterface } from './skills.repository.interface'

import { PrismaService } from '@prisma/prisma.service'
import { PrismaCommonRepository } from '@repositories/common.repository.prisma'

import { Injectable } from '@nestjs/common'
import { Prisma, Skill } from '@prisma/client'

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
