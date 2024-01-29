import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '@prisma/prisma.service'
import { PrismaSkillsRepository } from './repositories/skills.repository.prisma'
import { SkillsService } from './skills.service'

describe('SkillsService', () => {
  let service: SkillsService
  let prisma: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SkillsService, PrismaSkillsRepository, PrismaService],
    }).compile()

    service = module.get<SkillsService>(SkillsService)
    prisma = module.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
    expect(prisma).toBeDefined()
  })
})
