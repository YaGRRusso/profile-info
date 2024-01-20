import { Module } from '@nestjs/common'
import { FormationsService } from './formations.service'
import { FormationsController } from './formations.controller'
import { PrismaFormationsRepository } from './repositories/formations.repository.prisma'

@Module({
  controllers: [FormationsController],
  providers: [FormationsService, PrismaFormationsRepository],
  exports: [FormationsService],
})
export class FormationsModule {}
