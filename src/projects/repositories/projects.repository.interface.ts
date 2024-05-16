import { CommonRepositoryInterface } from '@/common/repositories/common.repository.interface'

import { Prisma, Project } from '@prisma/client'

export interface ProjectsRepositoryInterface
  extends CommonRepositoryInterface<
    Project,
    Prisma.ProjectFindManyArgs,
    Prisma.ProjectFindUniqueArgs,
    Prisma.ProjectCreateArgs,
    Prisma.ProjectDeleteArgs,
    Prisma.ProjectUpdateArgs
  > {}
