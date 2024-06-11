import { CoursesController } from '../courses/courses.controller'
import { CoursesService } from '../courses/courses.service'

import { AuthRequest } from '@/auth/entities/request.entity'
import { PrismaService } from '@/common/prisma/prisma.service'

import { Test, TestingModule } from '@nestjs/testing'
import { PrismaClient } from '@prisma/client'

describe('CoursesController', () => {
  let controller: CoursesController
  let prisma: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoursesController],
      providers: [CoursesService, PrismaClient, PrismaService],
    }).compile()

    controller = module.get<CoursesController>(CoursesController)
    prisma = module.get<PrismaService>(PrismaService)
  })

  it('should return the correct type', async () => {
    const req = { user: { id: '1' } } as AuthRequest
    const result = await controller.findAll(req, { limit: 5, page: 1 })

    expect(result).toBeDefined()
    expect(Object.keys(result).length).toBe(2)
    expect(result.data).toBeInstanceOf(Array)
    expect(result.pagination).toBeInstanceOf(Object)
  })
})
