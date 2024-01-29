import { Experience, Prisma } from '@prisma/client'
import { CommonRepositoryInterface } from '@repositories/common.repository.interface'

export interface ExperiencesRepositoryInterface
  extends CommonRepositoryInterface<
    Experience,
    Prisma.ExperienceFindManyArgs,
    Prisma.ExperienceFindUniqueArgs,
    Prisma.ExperienceCreateArgs,
    Prisma.ExperienceDeleteArgs,
    Prisma.ExperienceUpdateArgs
  > {}
