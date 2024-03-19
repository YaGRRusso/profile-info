import { FormationsRepositoryInterface } from './formations.repository.interface'

import { PrismaService } from '@prisma/prisma.service'
import { PrismaCommonRepository } from '@repositories/common.repository.prisma'

import { Injectable } from '@nestjs/common'
import { Formation, Prisma } from '@prisma/client'

@Injectable()
export class PrismaFormationsRepository
  extends PrismaCommonRepository<
    Formation,
    Prisma.FormationFindManyArgs,
    Prisma.FormationFindUniqueArgs,
    Prisma.FormationCreateArgs,
    Prisma.FormationDeleteArgs,
    Prisma.FormationUpdateArgs
  >
  implements FormationsRepositoryInterface
{
  constructor(protected prisma: PrismaService) {
    super(prisma, 'Formation')
  }
}
