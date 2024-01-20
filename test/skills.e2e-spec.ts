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

  it('/skills (GET)', async () => {
    return await request(app.getHttpServer())
      .get('/skills')
      .expect(200)
      .expect(({ body }) => {
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
})
