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

  it('/users (GET)', async () => {
    const { body, status } = await request(app.getHttpServer()).get('/users')

    expect(status).toBe(200)
    expect(body).toBeInstanceOf(Array)
    body.forEach((user) => {
      expect(user).toHaveProperty('id')
      expect(user).toHaveProperty('picture')
      expect(user).toHaveProperty('name')
      expect(user).toHaveProperty('nickname')
      expect(user).toHaveProperty('email')
      expect(user).toHaveProperty('password')
      expect(user).toHaveProperty('phone')
      expect(user).toHaveProperty('birth')
      expect(user).toHaveProperty('title')
      expect(user).toHaveProperty('description')
      expect(user).toHaveProperty('address')
      expect(user).toHaveProperty('postal')
      expect(user).toHaveProperty('role')
      expect(user).toHaveProperty('createdAt')
      expect(user).toHaveProperty('updatedAt')
    })
  })
})
