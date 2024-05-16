import { FormationsController } from '../formations/formations.controller'
import { FormationsService } from '../formations/formations.service'

import { PrismaService } from '@/common/prisma/prisma.service'

import { Test, TestingModule } from '@nestjs/testing'
import { PrismaClient } from '@prisma/client'

describe('FormationsController', () => {
  let controller: FormationsController
  let prisma: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FormationsController],
      providers: [FormationsService, PrismaClient, PrismaService],
    }).compile()

    controller = module.get<FormationsController>(FormationsController)
    prisma = module.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
    expect(prisma).toBeDefined()
  })
})
