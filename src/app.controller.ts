import { AppService } from './app.service'

import { IsPublic } from '@/auth/decorators/public.decorator'

import { Controller, Get } from '@nestjs/common'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @IsPublic()
  @Get()
  getHello(): Record<string, unknown> {
    return this.appService.getHello()
  }
}
