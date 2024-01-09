import { Injectable } from '@nestjs/common'
import { PrismaService } from '@prisma/prisma.service'
import { PrismaCommonRepository } from '@repositories/common.repository.prisma'
import { Prisma, User } from '@prisma/client'
import { UsersRepositoryInterface } from './users.repository.interface'

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
