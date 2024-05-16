import { CommonRepositoryInterface } from '@/common/repositories/common.repository.interface'

import { Prisma, User } from '@prisma/client'

export interface UsersRepositoryInterface
  extends CommonRepositoryInterface<
    User,
    Prisma.UserFindManyArgs,
    Prisma.UserFindUniqueArgs,
    Prisma.UserCreateArgs,
    Prisma.UserDeleteArgs,
    Prisma.UserUpdateArgs
  > {}
