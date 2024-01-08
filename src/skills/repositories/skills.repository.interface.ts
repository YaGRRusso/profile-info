import { Prisma, Skill } from '@prisma/client'
import { CommonRepositoryInterface } from '@repositories/common.repository.interface'

export interface SkillsRepositoryInterface
  extends CommonRepositoryInterface<
    Skill,
    Prisma.SkillFindManyArgs,
    Prisma.SkillFindUniqueArgs,
    Prisma.SkillCreateArgs,
    Prisma.SkillDeleteArgs,
    Prisma.SkillUpdateArgs
  > {}
