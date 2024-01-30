import { AppModule } from '@src/app.module'

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

  it('/skills (GET)', async () => {
    const { body, status } = await request(app.getHttpServer()).get('/skills')

    expect(status).toBe(200)
    expect(body).toBeInstanceOf(Array)
    body.forEach((skill) => {
      expect(skill).toHaveProperty('id')
      expect(skill).toHaveProperty('name')
      expect(skill).toHaveProperty('category')
      expect(skill).toHaveProperty('createdAt')
      expect(skill).toHaveProperty('updatedAt')
    })
  })
})
