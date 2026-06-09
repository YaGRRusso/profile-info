import { INestApplication } from "@nestjs/common";
import { App } from "supertest/types";
import { CoursesService } from "@/modules/courses/courses.service";
import { CourseStatus } from "@/modules/courses/enums/status.enum";
import { OrganizationCategory } from "@/modules/organizations/enums/category.enum";
import { OrganizationsService } from "@/modules/organizations/organizations.service";
import { SkillCategory } from "@/modules/skills/enums/category.enum";
import { SkillsService } from "@/modules/skills/skills.service";
import { clearTestDatabase } from "../support/clear-test-database";
import { createTestApp } from "../support/create-test-app";
import { startTestMongo } from "../support/mongo-memory";
import { applyTestEnv } from "../support/test-env";

describe("Skill delete cascade (integration)", () => {
  let app: INestApplication<App> | undefined;
  let skillsService: SkillsService;
  let coursesService: CoursesService;
  let organizationsService: OrganizationsService;

  beforeAll(async () => {
    const mongo = await startTestMongo();
    applyTestEnv(mongo.uri);

    const testApp = await createTestApp();
    app = testApp.app;
    await clearTestDatabase(testApp.module);

    skillsService = testApp.module.get(SkillsService);
    coursesService = testApp.module.get(CoursesService);
    organizationsService = testApp.module.get(OrganizationsService);
  });

  afterAll(async () => {
    await app?.close();
  });

  it("should detach a deleted skill from courses", async () => {
    const organization = await organizationsService.createOne({
      slug: "acme-corp",
      name: "Acme Corp",
      website: "https://acme.example",
      logo: "https://acme.example/logo.png",
      category: OrganizationCategory.COMPANY,
      i18n: [
        {
          locale: "en",
          messages: { description: "Acme Corp description" },
        },
      ],
    });

    const skill = await skillsService.createOne({
      slug: "typescript",
      name: "TypeScript",
      category: SkillCategory.LANGUAGE,
    });

    const course = await coursesService.createOne({
      slug: "typescript-course",
      organization: organization._id.toString(),
      status: CourseStatus.COMPLETE,
      i18n: [
        {
          locale: "en",
          messages: {
            title: "TypeScript Course",
            description: "Learn TypeScript",
          },
        },
      ],
      skills: [skill._id.toString()],
    });

    expect(course.skills?.map((id) => id.toString())).toContain(
      skill._id.toString()
    );

    await skillsService.removeOne(skill._id.toString());

    const updatedCourse = await coursesService.findOneById(
      course._id.toString()
    );

    const skillIds = (updatedCourse.skills ?? []).map((id) => id.toString());
    expect(skillIds).not.toContain(skill._id.toString());
  });
});
