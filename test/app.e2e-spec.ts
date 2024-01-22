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

  it('/ (GET)', async () => {
    const { body, status } = await request(app.getHttpServer()).get('/')

    expect(status).toBe(200)
    expect(body).toHaveProperty('name')
    expect(body).toHaveProperty('version')
    expect(body).toHaveProperty('url')
    expect(body).toHaveProperty('repo')
  })
})
