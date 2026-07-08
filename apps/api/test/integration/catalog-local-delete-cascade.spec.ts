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
import { organizationI18n } from "../support/organization-i18n";
import { skillI18n } from "../support/skill-i18n";

describe("Catalog LOCAL delete cascade (integration)", () => {
  let app: INestApplication<App> | undefined;
  let skillsService: SkillsService;
  let organizationsService: OrganizationsService;
  let coursesService: CoursesService;

  beforeAll(async () => {
    const testApp = await createTestApp();
    app = testApp.app;
    await clearTestDatabase(testApp.module);

    skillsService = testApp.module.get(SkillsService);
    organizationsService = testApp.module.get(OrganizationsService);
    coursesService = testApp.module.get(CoursesService);
  });

  afterAll(async () => {
    await app?.close();
  });

  it("should detach a deleted LOCAL skill owned by the caller", async () => {
    const usersService = app!.get(UsersService);
    const owner = await usersService.createOne(testSuperAdminContext(), {
      name: "Local Skill Owner",
      nickname: "local-skill-owner",
      email: "local-skill-owner@profile.info",
      password: "owner.123",
      role: UserRole.USER,
    });
    const ownerCtx = testAuthContext({ id: owner.id });

    const organization = await organizationsService.createOne(
      testSuperAdminContext(),
      {
        slug: "local-skill-cascade-org",
        name: "Cascade Org",
        website: "https://cascade.example",
        logo: "https://cascade.example/logo.png",
        category: OrganizationCategory.COMPANY,
        i18n: organizationI18n("Cascade org"),
      }
    );

    const localSkill = await skillsService.createOne(ownerCtx, {
      slug: "local-cascade-skill",
      i18n: skillI18n("Local Cascade Skill"),
      category: "Programming",
    });

    const course = await coursesService.createOne(ownerCtx, {
      slug: "local-skill-cascade-course",
      organizationId: organization.id,
      status: CourseStatus.COMPLETE,
      i18n: [
        {
          locale: "en",
          messages: {
            title: "Local Skill Course",
            description: "Uses local skill",
          },
        },
      ],
      skillIds: [localSkill.id],
    } as CreateCourseInput);

    expect(course.skillIds?.map((id) => id.toString())).toContain(
      localSkill.id
    );

    await skillsService.removeOne(ownerCtx, localSkill.id);

    const updatedCourse = await coursesService.findOneById(ownerCtx, course.id);
    const skillIds = (updatedCourse.skillIds ?? []).map((id) => id.toString());
    expect(skillIds).not.toContain(localSkill.id);
  });

  it("should purge courses when the caller deletes their own LOCAL organization", async () => {
    const usersService = app!.get(UsersService);
    const owner = await usersService.createOne(testSuperAdminContext(), {
      name: "Local Org Owner",
      nickname: "local-org-owner",
      email: "local-org-owner@profile.info",
      password: "owner.123",
      role: UserRole.USER,
    });
    const ownerCtx = testAuthContext({ id: owner.id });

    const localOrg = await organizationsService.createOne(ownerCtx, {
      slug: "local-cascade-org",
      name: "Local Cascade Org",
      website: "https://local-cascade.example",
      logo: "https://local-cascade.example/logo.png",
      category: OrganizationCategory.COMPANY,
      i18n: organizationI18n("Local cascade org"),
    });

    const course = await coursesService.createOne(ownerCtx, {
      slug: "local-org-cascade-course",
      organizationId: localOrg.id,
      status: CourseStatus.COMPLETE,
      i18n: [
        {
          locale: "en",
          messages: {
            title: "Local Org Course",
            description: "Uses local org",
          },
        },
      ],
    } as CreateCourseInput);

    await organizationsService.removeOne(ownerCtx, localOrg.id);

    await expect(
      coursesService.findOneById(ownerCtx, course.id)
    ).rejects.toThrow("Not Found");
  });
});
