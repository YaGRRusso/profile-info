import { PrismaUsersRepository } from './repositories/users.repository.prisma'
import { UsersService } from './users.service'

import { PrismaService } from '@prisma/prisma.service'

import { Test, TestingModule } from '@nestjs/testing'

describe('UsersService', () => {
  let service: UsersService
  let prisma: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, PrismaUsersRepository, PrismaService],
    }).compile()

    service = module.get<UsersService>(UsersService)
    prisma = module.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
    expect(prisma).toBeDefined()
  })
})
