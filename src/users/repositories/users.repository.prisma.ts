import { Injectable } from '@nestjs/common'
import { User } from '../entities/user.entity'
import { UsersRepositoryInterface } from './users.repository.interface'
import { PrismaService } from 'src/common/prisma/prisma.service'
import { PrismaCommonRepository } from '@repositories/common.repository.prisma'

@Injectable()
export class PrismaUsersRepository
  extends PrismaCommonRepository<User>
  implements UsersRepositoryInterface
{
  constructor(protected prisma: PrismaService) {
    super(prisma, User)
  }
}
