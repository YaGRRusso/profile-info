import { CommonRepositoryInterface } from '@/common/repositories/common.repository.interface'

import { Formation, Prisma } from '@prisma/client'

export interface FormationsRepositoryInterface
  extends CommonRepositoryInterface<
    Formation,
    Prisma.FormationFindManyArgs,
    Prisma.FormationFindUniqueArgs,
    Prisma.FormationCreateArgs,
    Prisma.FormationDeleteArgs,
    Prisma.FormationUpdateArgs
  > {}
