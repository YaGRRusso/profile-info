import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { App } from "supertest/types";
import { UserRole } from "@/core/enums/user-role.enum";
import { SkillsService } from "@/modules/skills/skills.service";
import { UsersService } from "@/modules/users/users.service";
import { clearTestDatabase } from "../support/clear-test-database";
import { createTestApp } from "../support/create-test-app";
import { skillI18n } from "../support/skill-i18n";

const PDF_CONTENT_TYPE = /application\/pdf/;

describe("ResumeController (e2e)", () => {
  let app: INestApplication<App> | undefined;
  let profileUserId: string;

  beforeAll(async () => {
    const testApp = await createTestApp();
    app = testApp.app;
    await clearTestDatabase(testApp.module);

    const usersService = testApp.module.get(UsersService);
    const skillsService = testApp.module.get(SkillsService);

    const profileUser = await usersService.createOne({
      name: "Admin User",
      nickname: "admin",
      email: "admin@profile.info",
      password: "123123",
      role: UserRole.SUPER_ADMIN,
      i18n: [
        {
          locale: "en",
          messages: {
            title: "Software Engineer",
            description: "Backend developer",
          },
        },
      ],
    });
    profileUserId = profileUser.id;

    await skillsService.createOne({
      slug: "typescript",
      i18n: skillI18n("TypeScript"),
      category: "Programming",
    });
  });

  afterAll(async () => {
    await app?.close();
  });

  it("/resume.pdf (GET) requires userId", async () => {
    await request(app!.getHttpServer())
      .get("/resume.pdf")
      .expect(400)
      .expect((response) => {
        expect(response.body.message).toContain("userId is required");
      });
  });

  it("/resume.pdf (GET) rejects invalid userId", async () => {
    await request(app!.getHttpServer())
      .get("/resume.pdf?userId=not-an-object-id")
      .expect(400);
  });

  it("/resume.pdf (GET) returns 404 for unknown userId", async () => {
    await request(app!.getHttpServer())
      .get("/resume.pdf?userId=507f1f77bcf86cd799439011")
      .expect(404);
  });

  it("/resume.pdf (GET) returns a PDF attachment", async () => {
    const response = await request(app!.getHttpServer())
      .get(`/resume.pdf?userId=${profileUserId}`)
      .expect(200)
      .expect("Content-Type", PDF_CONTENT_TYPE)
      .expect("Content-Disposition", 'attachment; filename="resume.pdf"');

    expect(response.body.subarray(0, 4).toString()).toBe("%PDF");
  });

  it("/resume.pdf?locale=pt (GET) returns a PDF attachment", async () => {
    const response = await request(app!.getHttpServer())
      .get(`/resume.pdf?userId=${profileUserId}&locale=pt`)
      .expect(200)
      .expect("Content-Type", PDF_CONTENT_TYPE)
      .expect("Content-Disposition", 'attachment; filename="resume.pdf"');

    expect(response.body.subarray(0, 4).toString()).toBe("%PDF");
  });

  it("/resume.pdf?locale=invalid (GET) falls back to default locale", async () => {
    await request(app!.getHttpServer())
      .get(`/resume.pdf?userId=${profileUserId}&locale=invalid`)
      .expect(200)
      .expect("Content-Type", PDF_CONTENT_TYPE);
  });
});
