import { INestApplication, ValidationPipe } from '@nestjs/common'

export const validationConfig = (app: INestApplication) => {
  return app.useGlobalPipes(new ValidationPipe())
}
