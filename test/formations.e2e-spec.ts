import { AppModule } from '@/app.module'

import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'

describe('AppController (e2e)', () => {
  let app: INestApplication

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  it('/formations (GET)', async () => {
    const { body, status } = await request(app.getHttpServer()).get(
      '/formations',
    )

    expect(status).toBe(200)
    expect(body).toBeInstanceOf(Array)
    body.forEach((formation) => {
      expect(formation).toHaveProperty('id')
      expect(formation).toHaveProperty('name')
      expect(formation).toHaveProperty('school')
      expect(formation).toHaveProperty('description')
      expect(formation).toHaveProperty('status')
      expect(formation).toHaveProperty('certificate')
      expect(formation).toHaveProperty('start')
      expect(formation).toHaveProperty('end')
      expect(formation).toHaveProperty('createdAt')
      expect(formation).toHaveProperty('updatedAt')
      expect(formation).toHaveProperty('userId')
    })
  })
})
