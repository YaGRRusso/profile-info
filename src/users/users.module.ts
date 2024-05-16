import { UsersController } from './users.controller'
import { UsersService } from './users.service'

import { Module } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaClient],
  exports: [UsersService],
})
export class UsersModule {}
