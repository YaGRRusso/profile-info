import { Module } from '@nestjs/common'
import { PrismaUsersRepository } from './repositories/users.repository.prisma'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaUsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
