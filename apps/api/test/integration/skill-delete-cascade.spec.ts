import { INestApplication } from "@nestjs/common";
import { testAuthContext } from "@test/fixtures/auth-context";
import { App } from "supertest/types";
import { UserRole } from "@/core/enums/user-role.enum";
import { CoursesService } from "@/modules/courses/courses.service";
import { CreateCourseInput } from "@/modules/courses/dto/create-course.input";
import { CourseStatus } from "@/modules/courses/enums/status.enum";
import { OrganizationCategory } from "@/modules/organizations/enums/category.enum";
import { OrganizationsService } from "@/modules/organizations/organizations.service";
import { SkillsService } from "@/modules/skills/skills.service";
import { UsersService } from "@/modules/users/users.service";
import { clearTestDatabase } from "../support/clear-test-database";
import { createTestApp } from "../support/create-test-app";
import { skillI18n } from "../support/skill-i18n";

describe("Skill delete cascade (integration)", () => {
  let app: INestApplication<App> | undefined;
  let skillsService: SkillsService;
  let coursesService: CoursesService;
  let organizationsService: OrganizationsService;

  beforeAll(async () => {
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
    const usersService = app!.get(UsersService);
    const owner = await usersService.createOne({
      name: "Owner",
      nickname: "owner",
      email: "owner@profile.info",
      password: "owner.123",
      role: UserRole.USER,
    });

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
      i18n: skillI18n("TypeScript"),
      category: "Programming",
    });

    const ownerCtx = testAuthContext({ id: owner.id });

    const course = await coursesService.createOne(ownerCtx, {
      slug: "typescript-course",
      organizationId: organization.id,
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
      skillIds: [skill.id],
    } as CreateCourseInput);

    expect(course.skillIds?.map((id) => id.toString())).toContain(skill.id);

    await skillsService.removeOne(skill.id);

    const updatedCourse = await coursesService.findOneById(ownerCtx, course.id);

    const skillIds = (updatedCourse.skillIds ?? []).map((id) => id.toString());
    expect(skillIds).not.toContain(skill.id);
  });
});
