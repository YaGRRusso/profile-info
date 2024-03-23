import { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import * as fs from 'fs'

export const swaggerConfig = (app: INestApplication) => {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Profile Info')
    .setDescription('Api de informações pessoais feita em NestJS com Prisma')
    .setVersion('1.0')
    .addTag('users')
    .addTag('skills')
    .addTag('projects')
    .addTag('formations')
    .addTag('courses')
    .addTag('experiences')
    .build()
  const document = SwaggerModule.createDocument(app, swaggerConfig)

  const json = JSON.stringify(document, null, 2)
  fs.writeFileSync('swagger.json', json)

  return SwaggerModule.setup('swagger', app, document)
}
