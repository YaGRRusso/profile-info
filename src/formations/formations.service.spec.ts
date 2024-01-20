import { Test, TestingModule } from '@nestjs/testing'
import { FormationsService } from './formations.service'
import { PrismaService } from '@prisma/prisma.service'
import { PrismaFormationsRepository } from './repositories/formations.repository.prisma'

describe('FormationsService', () => {
  let service: FormationsService
  let prisma: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FormationsService, PrismaFormationsRepository, PrismaService],
    }).compile()

    service = module.get<FormationsService>(FormationsService)
    prisma = module.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
    expect(prisma).toBeDefined()
  })
})
