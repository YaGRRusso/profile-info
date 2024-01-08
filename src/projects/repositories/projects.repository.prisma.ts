import { Injectable } from '@nestjs/common'
import { ProjectsRepositoryInterface } from './projects.repository.interface'
import { Project } from '../entities/project.entity'
import { PrismaService } from '@prisma/prisma.service'
import { PrismaCommonRepository } from '@repositories/common.repository.prisma'
import { Prisma } from '@prisma/client'

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
