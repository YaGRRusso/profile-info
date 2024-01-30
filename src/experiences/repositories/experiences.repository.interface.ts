import { CommonRepositoryInterface } from '@repositories/common.repository.interface'

import { Experience, Prisma } from '@prisma/client'

export interface ExperiencesRepositoryInterface
  extends CommonRepositoryInterface<
    Experience,
    Prisma.ExperienceFindManyArgs,
    Prisma.ExperienceFindUniqueArgs,
    Prisma.ExperienceCreateArgs,
    Prisma.ExperienceDeleteArgs,
    Prisma.ExperienceUpdateArgs
  > {}
