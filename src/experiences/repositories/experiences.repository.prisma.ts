import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '@prisma/prisma.service'
import { PrismaCommonRepository } from '@repositories/common.repository.prisma'
import { Experience } from '../entities/experience.entity'
import { ExperiencesRepositoryInterface } from './experiences.repository.interface'

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
