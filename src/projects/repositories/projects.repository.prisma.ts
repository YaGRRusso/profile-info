import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '@prisma/prisma.service'
import { PrismaCommonRepository } from '@repositories/common.repository.prisma'
import { Project } from '../entities/project.entity'
import { ProjectsRepositoryInterface } from './projects.repository.interface'

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
