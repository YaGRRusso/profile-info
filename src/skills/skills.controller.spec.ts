import { Test, TestingModule } from '@nestjs/testing'
import { SkillsController } from './skills.controller'
import { SkillsService } from './skills.service'
import { PrismaService } from '@prisma/prisma.service'
import { PrismaSkillsRepository } from './repositories/skills.repository.prisma'

describe('SkillsController', () => {
  let controller: SkillsController
  let prisma: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SkillsController],
      providers: [SkillsService, PrismaSkillsRepository, PrismaService],
    }).compile()

    controller = module.get<SkillsController>(SkillsController)
    prisma = module.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
    expect(prisma).toBeDefined()
  })
})
