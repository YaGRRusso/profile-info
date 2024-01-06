import { Injectable } from '@nestjs/common'
import { ProjectsRepositoryInterface } from './projects.repository.interface'
import { Project } from '../entities/project.entity'
import { PrismaService } from '@prisma/prisma.service'
import { PrismaCommonRepository } from '@repositories/common.repository.prisma'

@Injectable()
export class PrismaProjectsRepository
  extends PrismaCommonRepository<Project>
  implements ProjectsRepositoryInterface
{
  constructor(protected prisma: PrismaService) {
    super(prisma, Project)
  }
}
