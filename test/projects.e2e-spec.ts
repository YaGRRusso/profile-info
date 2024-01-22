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

  it('/projects (GET)', async () => {
    const { body, status } = await request(app.getHttpServer()).get('/projects')

    expect(status).toBe(200)
    expect(body).toBeInstanceOf(Array)
    body.forEach((project) => {
      expect(project).toHaveProperty('id')
      expect(project).toHaveProperty('name')
      expect(project).toHaveProperty('description')
      expect(project).toHaveProperty('image')
      expect(project).toHaveProperty('link')
      expect(project).toHaveProperty('createdAt')
      expect(project).toHaveProperty('updatedAt')
      expect(project).toHaveProperty('userId')
    })
  })
})
