import { AppModule } from './app.module'

import { appConfig } from '@configs/app.config'
import { filtersConfig } from '@configs/filter.config'
import { swaggerConfig } from '@configs/swagger.config'
import { validationConfig } from '@configs/validation.config'

import { NestFactory } from '@nestjs/core'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  swaggerConfig(app)
  validationConfig(app)
  filtersConfig(app)
  await appConfig(app)
}
bootstrap()
