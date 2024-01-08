import { Prisma, Project } from '@prisma/client'
import { CommonRepositoryInterface } from '@repositories/common.repository.interface'

export interface ProjectsRepositoryInterface
  extends CommonRepositoryInterface<
    Project,
    Prisma.ProjectFindManyArgs,
    Prisma.ProjectFindUniqueArgs,
    Prisma.ProjectCreateArgs,
    Prisma.ProjectDeleteArgs,
    Prisma.ProjectUpdateArgs
  > {}
