import { CoursesService } from './courses.service'

import { Test, TestingModule } from '@nestjs/testing'
import { PrismaClient } from '@prisma/client'
import { PrismaService } from '@prisma/prisma.service'

describe('CoursesService', () => {
  let service: CoursesService
  let prisma: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CoursesService, PrismaClient, PrismaService],
    }).compile()

    service = module.get<CoursesService>(CoursesService)
    prisma = module.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
    expect(prisma).toBeDefined()
  })
})
