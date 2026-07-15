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
  let app: INestApplication<App>;
  let skillsService: SkillsService;
  let organizationsService: OrganizationsService;
  let coursesService: CoursesService;

  beforeAll(async () => {
    const testApp = await createTestApp();
    ({ app } = testApp);
    await clearTestDatabase(testApp.module);

    skillsService = testApp.module.get(SkillsService);
    organizationsService = testApp.module.get(OrganizationsService);
    coursesService = testApp.module.get(CoursesService);
  });

  afterAll(async () => {
    await app.close();
  });

  it("should detach a deleted LOCAL skill owned by the caller", async () => {
    const usersService = app.get(UsersService);
    const owner = await usersService.createOne(testSuperAdminContext(), {
      email: "local-skill-owner@profile.info",
      name: "Local Skill Owner",
      nickname: "local-skill-owner",
      password: "owner.123",
      role: UserRole.USER,
    });
    const ownerCtx = testAuthContext({ id: owner.id });

    const organization = await organizationsService.createOne(
      testSuperAdminContext(),
      {
        category: OrganizationCategory.COMPANY,
        i18n: organizationI18n("Cascade org"),
        logo: "https://cascade.example/logo.png",
        name: "Cascade Org",
        slug: "local-skill-cascade-org",
        website: "https://cascade.example",
      }
    );

    const localSkill = await skillsService.createOne(ownerCtx, {
      category: "Programming",
      i18n: skillI18n("Local Cascade Skill"),
      slug: "local-cascade-skill",
    });

    const course = await coursesService.createOne(ownerCtx, {
      i18n: [
        {
          locale: "en",
          messages: {
            description: "Uses local skill",
            title: "Local Skill Course",
          },
        },
      ],
      organizationId: organization.id,
      skillIds: [localSkill.id],
      slug: "local-skill-cascade-course",
      status: CourseStatus.COMPLETE,
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
    const usersService = app.get(UsersService);
    const owner = await usersService.createOne(testSuperAdminContext(), {
      email: "local-org-owner@profile.info",
      name: "Local Org Owner",
      nickname: "local-org-owner",
      password: "owner.123",
      role: UserRole.USER,
    });
    const ownerCtx = testAuthContext({ id: owner.id });

    const localOrg = await organizationsService.createOne(ownerCtx, {
      category: OrganizationCategory.COMPANY,
      i18n: organizationI18n("Local cascade org"),
      logo: "https://local-cascade.example/logo.png",
      name: "Local Cascade Org",
      slug: "local-cascade-org",
      website: "https://local-cascade.example",
    });

    const course = await coursesService.createOne(ownerCtx, {
      i18n: [
        {
          locale: "en",
          messages: {
            description: "Uses local org",
            title: "Local Org Course",
          },
        },
      ],
      organizationId: localOrg.id,
      slug: "local-org-cascade-course",
      status: CourseStatus.COMPLETE,
    } as CreateCourseInput);

    await organizationsService.removeOne(ownerCtx, localOrg.id);

    await expect(
      coursesService.findOneById(ownerCtx, course.id)
    ).rejects.toThrow("Not Found");
  });
});
