import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '@prisma/prisma.service'
import { ProjectsController } from './projects.controller'
import { ProjectsService } from './projects.service'
import { PrismaProjectsRepository } from './repositories/projects.repository.prisma'

describe('ProjectsController', () => {
  let controller: ProjectsController
  let prisma: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [ProjectsService, PrismaProjectsRepository, PrismaService],
    }).compile()

    controller = module.get<ProjectsController>(ProjectsController)
    prisma = module.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
    expect(prisma).toBeDefined()
  })
})
