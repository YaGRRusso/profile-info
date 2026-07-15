import { INestApplication } from "@nestjs/common";
import {
  testAuthContext,
  testSuperAdminContext,
} from "@test/fixtures/auth-context";
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
  let app: INestApplication<App>;
  let skillsService: SkillsService;
  let coursesService: CoursesService;
  let organizationsService: OrganizationsService;

  beforeAll(async () => {
    const testApp = await createTestApp();
    ({ app } = testApp);
    await clearTestDatabase(testApp.module);

    skillsService = testApp.module.get(SkillsService);
    coursesService = testApp.module.get(CoursesService);
    organizationsService = testApp.module.get(OrganizationsService);
  });

  afterAll(async () => {
    await app.close();
  });

  it("should detach a deleted skill from courses", async () => {
    const usersService = app.get(UsersService);
    const owner = await usersService.createOne(testSuperAdminContext(), {
      email: "owner@profile.info",
      name: "Owner",
      nickname: "owner",
      password: "owner.123",
      role: UserRole.USER,
    });

    const organization = await organizationsService.createOne(
      testSuperAdminContext(),
      {
        category: OrganizationCategory.COMPANY,
        i18n: [
          {
            locale: "en",
            messages: { description: "Acme Corp description" },
          },
        ],
        logo: "https://acme.example/logo.png",
        name: "Acme Corp",
        slug: "acme-corp",
        website: "https://acme.example",
      }
    );

    const skill = await skillsService.createOne(testSuperAdminContext(), {
      category: "Programming",
      i18n: skillI18n("TypeScript"),
      slug: "typescript",
    });

    const ownerCtx = testAuthContext({ id: owner.id });

    const course = await coursesService.createOne(ownerCtx, {
      i18n: [
        {
          locale: "en",
          messages: {
            description: "Learn TypeScript",
            title: "TypeScript Course",
          },
        },
      ],
      organizationId: organization.id,
      skillIds: [skill.id],
      slug: "typescript-course",
      status: CourseStatus.COMPLETE,
    } as CreateCourseInput);

    expect(course.skillIds?.map((id) => id.toString())).toContain(skill.id);

    await skillsService.removeOne(testSuperAdminContext(), skill.id);

    const updatedCourse = await coursesService.findOneById(ownerCtx, course.id);

    const skillIds = (updatedCourse.skillIds ?? []).map((id) => id.toString());
    expect(skillIds).not.toContain(skill.id);
  });

  it("should detach a deleted skill from user profile skillIds", async () => {
    const usersService = app.get(UsersService);

    const skill = await skillsService.createOne(testSuperAdminContext(), {
      category: "Healthcare",
      i18n: skillI18n("First Aid"),
      slug: "first-aid",
    });

    const user = await usersService.createOne(testSuperAdminContext(), {
      email: "profile-owner@profile.info",
      name: "Profile Owner",
      nickname: "profile-owner",
      password: "owner.123",
      role: UserRole.USER,
      skillIds: [skill.id],
    });

    expect(user.skillIds?.map((id) => id.toString())).toContain(skill.id);

    await skillsService.removeOne(testSuperAdminContext(), skill.id);

    const updatedUser = await usersService.findOneById(user.id);
    const skillIds = (updatedUser.skillIds ?? []).map((id) => id.toString());

    expect(skillIds).not.toContain(skill.id);
  });
});
