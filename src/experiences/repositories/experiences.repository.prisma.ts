import { ExperiencesRepositoryInterface } from './experiences.repository.interface'

import { PrismaService } from '@prisma/prisma.service'
import { PrismaCommonRepository } from '@repositories/common.repository.prisma'

import { Injectable } from '@nestjs/common'
import { Experience, Prisma } from '@prisma/client'

@Injectable()
export class PrismaExperiencesRepository
  extends PrismaCommonRepository<
    Experience,
    Prisma.ExperienceFindManyArgs,
    Prisma.ExperienceFindUniqueArgs,
    Prisma.ExperienceCreateArgs,
    Prisma.ExperienceDeleteArgs,
    Prisma.ExperienceUpdateArgs
  >
  implements ExperiencesRepositoryInterface
{
  constructor(protected prisma: PrismaService) {
    super(prisma, 'Experience')
  }
}
