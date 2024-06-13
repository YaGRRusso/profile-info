import { ProjectsController } from './projects.controller'
import { ProjectsService } from './projects.service'

import { PrismaService } from '@/common/prisma/prisma.service'

import { Test, TestingModule } from '@nestjs/testing'
import { PrismaClient } from '@prisma/client'

describe('ProjectsController', () => {
  let controller: ProjectsController
  let prisma: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [ProjectsService, PrismaClient, PrismaService],
    }).compile()

    controller = module.get<ProjectsController>(ProjectsController)
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
