import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

import { UsersService } from '../users/users.service'

import { PrismaService } from '@/common/prisma/prisma.service'

import { JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'
import { PrismaClient } from '@prisma/client'

describe('AuthController', () => {
  let controller: AuthController
  let prisma: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService, PrismaService, PrismaClient, UsersService, JwtService],
    }).compile()

    controller = module.get<AuthController>(AuthController)
    prisma = module.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
    expect(prisma).toBeDefined()
  })
})
