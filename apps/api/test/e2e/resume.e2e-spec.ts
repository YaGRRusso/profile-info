import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { App } from "supertest/types";
import { UserRole } from "@/core/enums/user-role.enum";
import { SkillCategory } from "@/modules/skills/enums/category.enum";
import { SkillsService } from "@/modules/skills/skills.service";
import { UsersService } from "@/modules/users/users.service";
import { clearTestDatabase } from "../support/clear-test-database";
import { createTestApp } from "../support/create-test-app";
import { startTestMongo } from "../support/mongo-memory";
import { applyTestEnv } from "../support/test-env";

const PDF_CONTENT_TYPE = /application\/pdf/;

describe("ResumeController (e2e)", () => {
  let app: INestApplication<App> | undefined;

  beforeAll(async () => {
    const mongo = await startTestMongo();
    applyTestEnv(mongo.uri);

    const testApp = await createTestApp();
    app = testApp.app;
    await clearTestDatabase(testApp.module);

    const usersService = testApp.module.get(UsersService);
    const skillsService = testApp.module.get(SkillsService);

    await usersService.createOne({
      name: "Admin User",
      nickname: "admin",
      email: "admin@profile.info",
      password: "pass.123",
      role: UserRole.ADMIN,
      title: "Software Engineer",
    });

    await skillsService.createOne({
      name: "TypeScript",
      slug: "typescript",
      category: SkillCategory.BACKEND,
      relevance: 5,
    });
  });

  afterAll(async () => {
    await app?.close();
  });

  it("/resume.pdf (GET) returns a PDF attachment", async () => {
    const response = await request(app!.getHttpServer())
      .get("/resume.pdf")
      .expect(200)
      .expect("Content-Type", PDF_CONTENT_TYPE)
      .expect("Content-Disposition", 'attachment; filename="resume.pdf"');

    expect(response.body.subarray(0, 4).toString()).toBe("%PDF");
  });

  it("/resume.pdf?locale=pt (GET) returns a PDF attachment", async () => {
    const response = await request(app!.getHttpServer())
      .get("/resume.pdf?locale=pt")
      .expect(200)
      .expect("Content-Type", PDF_CONTENT_TYPE)
      .expect("Content-Disposition", 'attachment; filename="resume.pdf"');

    expect(response.body.subarray(0, 4).toString()).toBe("%PDF");
  });

  it("/resume.pdf?locale=invalid (GET) falls back to default locale", async () => {
    await request(app!.getHttpServer())
      .get("/resume.pdf?locale=invalid")
      .expect(200)
      .expect("Content-Type", PDF_CONTENT_TYPE);
  });
});
