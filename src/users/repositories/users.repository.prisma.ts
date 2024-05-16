import { UsersRepositoryInterface } from './users.repository.interface'

import { PrismaService } from '@/common/prisma/prisma.service'
import { PrismaCommonRepository } from '@/common/repositories/common.repository.prisma'

import { Injectable } from '@nestjs/common'
import { Prisma, User } from '@prisma/client'

@Injectable()
export class PrismaUsersRepository
  extends PrismaCommonRepository<
    User,
    Prisma.UserFindManyArgs,
    Prisma.UserFindUniqueArgs,
    Prisma.UserCreateArgs,
    Prisma.UserDeleteArgs,
    Prisma.UserUpdateArgs
  >
  implements UsersRepositoryInterface
{
  constructor(protected prisma: PrismaService) {
    super(prisma, 'User')
  }
}
