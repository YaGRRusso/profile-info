import { IsPublic } from '@auth/decorators/public.decorator'
import { Controller, Get } from '@nestjs/common'
import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @IsPublic()
  @Get()
  getHello(): Record<string, unknown> {
    return this.appService.getHello()
  }
}
