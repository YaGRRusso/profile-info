import { ExperiencesController } from '../experiences/experiences.controller'
import { ExperiencesService } from '../experiences/experiences.service'
import { PrismaExperiencesRepository } from '../experiences/repositories/experiences.repository.prisma'

import { PrismaService } from '@/common/prisma/prisma.service'

import { Test, TestingModule } from '@nestjs/testing'

describe('ExperiencesController', () => {
  let controller: ExperiencesController
  let prisma: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExperiencesController],
      providers: [
        ExperiencesService,
        PrismaExperiencesRepository,
        PrismaService,
      ],
    }).compile()

    controller = module.get<ExperiencesController>(ExperiencesController)
    prisma = module.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
    expect(prisma).toBeDefined()
  })
})
