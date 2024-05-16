import { FormationsController } from './formations.controller'
import { FormationsService } from './formations.service'

import { Module } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Module({
  controllers: [FormationsController],
  providers: [FormationsService, PrismaClient],
  exports: [FormationsService],
})
export class FormationsModule {}
