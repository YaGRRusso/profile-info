import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { App } from "supertest/types";
import { validationConfig } from "@/core/configs/validation.config";
import { TestAppModule } from "./test-app.module";

export async function createTestApp(): Promise<{
  app: INestApplication<App>;
  module: TestingModule;
}> {
  const module = await Test.createTestingModule({
    imports: [TestAppModule],
  }).compile();

  const app = module.createNestApplication({ logger: false });
  validationConfig(app);
  await app.init();

  return { app, module };
}
