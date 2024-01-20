import { Test, TestingModule } from '@nestjs/testing'
import { CoursesService } from './courses.service'
import { PrismaService } from '@prisma/prisma.service'
import { PrismaCoursesRepository } from './repositories/courses.repository.prisma'

describe('CoursesService', () => {
  let service: CoursesService
  let prisma: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CoursesService, PrismaCoursesRepository, PrismaService],
    }).compile()

    service = module.get<CoursesService>(CoursesService)
    prisma = module.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
    expect(prisma).toBeDefined()
  })
})
