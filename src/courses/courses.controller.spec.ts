import { CoursesController } from '../courses/courses.controller'
import { CoursesService } from '../courses/courses.service'
import { PrismaCoursesRepository } from '../courses/repositories/courses.repository.prisma'

import { PrismaService } from '@prisma/prisma.service'

import { Test, TestingModule } from '@nestjs/testing'

describe('CoursesController', () => {
  let controller: CoursesController
  let prisma: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoursesController],
      providers: [CoursesService, PrismaCoursesRepository, PrismaService],
    }).compile()

    controller = module.get<CoursesController>(CoursesController)
    prisma = module.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
    expect(prisma).toBeDefined()
  })
})
