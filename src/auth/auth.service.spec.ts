import { AuthService } from './auth.service'

import { PrismaService } from '@prisma/prisma.service'
import { PrismaUsersRepository } from '@src/users/repositories/users.repository.prisma'
import { UsersService } from '@src/users/users.service'

import { JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'

describe('AuthService', () => {
  let service: AuthService
  let prisma: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        PrismaService,
        PrismaUsersRepository,
        UsersService,
        JwtService,
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
    prisma = module.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
    expect(prisma).toBeDefined()
  })
})
