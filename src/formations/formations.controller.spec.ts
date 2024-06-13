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

  // it('should return the correct type', async () => {
  //   const req = { user: { id: '1' } } as AuthRequest
  //   const result = await controller.findAll(req, { limit: 5, page: 1 })

  //   expect(result).toBeDefined()
  //   expect(Object.keys(result).length).toBe(2)
  //   expect(result.data).toBeInstanceOf(Array)
  //   expect(result.pagination).toBeInstanceOf(Object)
  // })
})
