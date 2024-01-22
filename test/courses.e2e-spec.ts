import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '@src/app.module'

describe('AppController (e2e)', () => {
  let app: INestApplication

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  it('/courses (GET)', async () => {
    const { body, status } = await request(app.getHttpServer()).get('/courses')

    expect(status).toBe(200)
    expect(body).toBeInstanceOf(Array)
    body.forEach((course) => {
      expect(course).toHaveProperty('id')
      expect(course).toHaveProperty('name')
      expect(course).toHaveProperty('school')
      expect(course).toHaveProperty('description')
      expect(course).toHaveProperty('status')
      expect(course).toHaveProperty('certificate')
      expect(course).toHaveProperty('hours')
      expect(course).toHaveProperty('createdAt')
      expect(course).toHaveProperty('updatedAt')
      expect(course).toHaveProperty('userId')
    })
  })
})
