import { PrismaUsersRepository } from './repositories/users.repository.prisma'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'

import { PrismaService } from '@prisma/prisma.service'

import { Test, TestingModule } from '@nestjs/testing'

describe('UsersController', () => {
  let controller: UsersController
  let prisma: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService, PrismaUsersRepository, PrismaService],
    }).compile()

    controller = module.get<UsersController>(UsersController)
    prisma = module.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
    expect(prisma).toBeDefined()
  })
})
