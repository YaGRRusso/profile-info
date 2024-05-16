import { ProjectsService } from './projects.service'
import { PrismaProjectsRepository } from './repositories/projects.repository.prisma'

import { PrismaService } from '@/common/prisma/prisma.service'

import { Test, TestingModule } from '@nestjs/testing'

describe('ProjectsService', () => {
  let service: ProjectsService
  let prisma: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectsService, PrismaProjectsRepository, PrismaService],
    }).compile()

    service = module.get<ProjectsService>(ProjectsService)
    prisma = module.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
    expect(prisma).toBeDefined()
  })
})
