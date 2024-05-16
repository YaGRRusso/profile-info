import { CommonRepositoryInterface } from '@/common/repositories/common.repository.interface'

import { Prisma, Skill } from '@prisma/client'

export interface SkillsRepositoryInterface
  extends CommonRepositoryInterface<
    Skill,
    Prisma.SkillFindManyArgs,
    Prisma.SkillFindUniqueArgs,
    Prisma.SkillCreateArgs,
    Prisma.SkillDeleteArgs,
    Prisma.SkillUpdateArgs
  > {}
