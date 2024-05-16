import { ProjectsRepositoryInterface } from './projects.repository.interface'

import { PrismaService } from '@/common/prisma/prisma.service'
import { PrismaCommonRepository } from '@/common/repositories/common.repository.prisma'

import { Injectable } from '@nestjs/common'
import { Prisma, Project } from '@prisma/client'

@Injectable()
export class PrismaProjectsRepository
  extends PrismaCommonRepository<
    Project,
    Prisma.ProjectFindManyArgs,
    Prisma.ProjectFindUniqueArgs,
    Prisma.ProjectCreateArgs,
    Prisma.ProjectDeleteArgs,
    Prisma.ProjectUpdateArgs
  >
  implements ProjectsRepositoryInterface
{
  constructor(protected prisma: PrismaService) {
    super(prisma, 'Project')
  }
}
