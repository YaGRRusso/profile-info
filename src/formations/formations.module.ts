import { FormationsController } from './formations.controller'
import { FormationsService } from './formations.service'
import { PrismaFormationsRepository } from './repositories/formations.repository.prisma'

import { Module } from '@nestjs/common'

@Module({
  controllers: [FormationsController],
  providers: [FormationsService, PrismaFormationsRepository],
  exports: [FormationsService],
})
export class FormationsModule {}
