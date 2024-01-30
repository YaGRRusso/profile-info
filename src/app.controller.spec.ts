import { AppController } from './app.controller'
import { AppService } from './app.service'

import { Test, TestingModule } from '@nestjs/testing'

describe('AppController', () => {
  let controller: AppController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile()

    controller = module.get(AppController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('should return app infos', () => {
    expect(controller.getHello()).toEqual(
      expect.objectContaining({
        name: expect.anything(),
        version: expect.anything(),
        url: expect.anything(),
        repo: expect.anything(),
      }),
    )
  })
})
