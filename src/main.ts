import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { appConfig } from '@configs/app.config'
import { validationConfig } from '@configs/validation.config'
import { filtersConfig } from '@configs/filter.config'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  validationConfig(app)
  filtersConfig(app)
  await appConfig(app)
}
bootstrap()
