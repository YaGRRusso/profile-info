import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { App } from "supertest/types";
import { createTestApp } from "../support/create-test-app";

describe("AppController (e2e)", () => {
  let app: INestApplication<App> | undefined;

  beforeAll(async () => {
    const testApp = await createTestApp();
    app = testApp.app;
  });

  afterAll(async () => {
    await app?.close();
  });

  it("/ (GET)", () =>
    request(app!.getHttpServer()).get("/").expect(200).expect("Hello World!"));
});
