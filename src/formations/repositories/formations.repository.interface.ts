import { Formation, Prisma } from '@prisma/client'
import { CommonRepositoryInterface } from '@repositories/common.repository.interface'

export interface FormationsRepositoryInterface
  extends CommonRepositoryInterface<
    Formation,
    Prisma.FormationFindManyArgs,
    Prisma.FormationFindUniqueArgs,
    Prisma.FormationCreateArgs,
    Prisma.FormationDeleteArgs,
    Prisma.FormationUpdateArgs
  > {}
