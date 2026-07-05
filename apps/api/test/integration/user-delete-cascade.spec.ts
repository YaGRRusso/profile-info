import { ForbiddenException, INestApplication } from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import {
  testAuthContext,
  testSuperAdminContext,
} from "@test/fixtures/auth-context";
import { Model } from "mongoose";
import { App } from "supertest/types";
import { ApiTokenPermission } from "@/core/enums/api-token-permission.enum";
import { UserRole } from "@/core/enums/user-role.enum";
import { ApiTokensService } from "@/modules/api-tokens/api-tokens.service";
import { ApiTokenModel } from "@/modules/api-tokens/schemas/api-token.schema";
import { CoursesService } from "@/modules/courses/courses.service";
import { CourseStatus } from "@/modules/courses/enums/status.enum";
import { CourseModel } from "@/modules/courses/schemas/course.schema";
import { EducationsService } from "@/modules/educations/educations.service";
import { EducationLevel } from "@/modules/educations/enums/level.enum";
import { EducationStatus } from "@/modules/educations/enums/status.enum";
import { EducationModel } from "@/modules/educations/schemas/education.schema";
import { ExperienceCategory } from "@/modules/experiences/enums/category.enum";
import { ExperiencesService } from "@/modules/experiences/experiences.service";
import { ExperienceModel } from "@/modules/experiences/schemas/experience.schema";
import { OrganizationCategory } from "@/modules/organizations/enums/category.enum";
import { OrganizationsService } from "@/modules/organizations/organizations.service";
import { ProjectsService } from "@/modules/projects/projects.service";
import { ProjectModel } from "@/modules/projects/schemas/project.schema";
import { UsersService } from "@/modules/users/users.service";
import { clearTestDatabase } from "../support/clear-test-database";
import { createTestApp } from "../support/create-test-app";

describe("User delete cascade (integration)", () => {
  let app: INestApplication<App> | undefined;
  let usersService: UsersService;
  let courseModel: Model<CourseModel>;
  let educationModel: Model<EducationModel>;
  let experienceModel: Model<ExperienceModel>;
  let projectModel: Model<ProjectModel>;
  let apiTokenModel: Model<ApiTokenModel>;

  beforeAll(async () => {
    const testApp = await createTestApp();
    app = testApp.app;
    await clearTestDatabase(testApp.module);

    usersService = testApp.module.get(UsersService);
    courseModel = testApp.module.get(getModelToken(CourseModel.name));
    educationModel = testApp.module.get(getModelToken(EducationModel.name));
    experienceModel = testApp.module.get(getModelToken(ExperienceModel.name));
    projectModel = testApp.module.get(getModelToken(ProjectModel.name));
    apiTokenModel = testApp.module.get(getModelToken(ApiTokenModel.name));
  });

  afterAll(async () => {
    await app?.close();
  });

  it("should cascade private entities and API tokens without leaving orphans", async () => {
    const organizationsService = app!.get(OrganizationsService);
    const coursesService = app!.get(CoursesService);
    const educationsService = app!.get(EducationsService);
    const experiencesService = app!.get(ExperiencesService);
    const projectsService = app!.get(ProjectsService);
    const apiTokensService = app!.get(ApiTokensService);

    const organization = await organizationsService.createOne(
      testSuperAdminContext(),
      {
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
      }
    );

    const doomedUser = await usersService.createOne(testSuperAdminContext(), {
      name: "Doomed",
      nickname: "doomed",
      email: "doomed@profile.info",
      password: "doomed.123",
      role: UserRole.USER,
    });

    const survivorUser = await usersService.createOne(testSuperAdminContext(), {
      name: "Survivor",
      nickname: "survivor",
      email: "survivor@profile.info",
      password: "survivor.123",
      role: UserRole.USER,
    });

    const doomedCtx = testAuthContext({ id: doomedUser.id });
    const survivorCtx = testAuthContext({ id: survivorUser.id });

    await coursesService.createOne(doomedCtx, {
      slug: "doomed-course",
      organizationId: organization.id,
      status: CourseStatus.COMPLETE,
      i18n: [
        {
          locale: "en",
          messages: { title: "Doomed Course", description: "Gone soon" },
        },
      ],
    });

    await educationsService.createOne(doomedCtx, {
      slug: "doomed-education",
      organizationId: organization.id,
      level: EducationLevel.BACHELOR,
      status: EducationStatus.COMPLETE,
      i18n: [
        {
          locale: "en",
          messages: { title: "Doomed Education", description: "Gone soon" },
        },
      ],
    });

    await experiencesService.createOne(doomedCtx, {
      slug: "doomed-experience",
      organizationId: organization.id,
      category: ExperienceCategory.FULL_TIME,
      roles: [
        {
          i18n: [
            {
              locale: "en",
              messages: { title: "Doomed Role", description: "Gone soon" },
            },
          ],
        },
      ],
    });

    await projectsService.createOne(doomedCtx, {
      slug: "doomed-project",
      i18n: [
        {
          locale: "en",
          messages: { title: "Doomed Project", description: "Gone soon" },
        },
      ],
    });

    await apiTokensService.createOne(doomedCtx, {
      name: "doomed-token",
      permissions: [ApiTokenPermission.QUERY],
    });

    await coursesService.createOne(survivorCtx, {
      slug: "survivor-course",
      organizationId: organization.id,
      status: CourseStatus.COMPLETE,
      i18n: [
        {
          locale: "en",
          messages: { title: "Survivor Course", description: "Stays" },
        },
      ],
    });

    expect(await courseModel.countDocuments({ ownerId: doomedUser.id })).toBe(
      1
    );
    expect(
      await educationModel.countDocuments({ ownerId: doomedUser.id })
    ).toBe(1);
    expect(
      await experienceModel.countDocuments({ ownerId: doomedUser.id })
    ).toBe(1);
    expect(await projectModel.countDocuments({ ownerId: doomedUser.id })).toBe(
      1
    );
    expect(await apiTokenModel.countDocuments({ ownerId: doomedUser.id })).toBe(
      1
    );

    await usersService.removeOne(doomedUser.id);

    expect(await courseModel.countDocuments({ ownerId: doomedUser.id })).toBe(
      0
    );
    expect(
      await educationModel.countDocuments({ ownerId: doomedUser.id })
    ).toBe(0);
    expect(
      await experienceModel.countDocuments({ ownerId: doomedUser.id })
    ).toBe(0);
    expect(await projectModel.countDocuments({ ownerId: doomedUser.id })).toBe(
      0
    );
    expect(await apiTokenModel.countDocuments({ ownerId: doomedUser.id })).toBe(
      0
    );

    expect(await courseModel.countDocuments({ ownerId: survivorUser.id })).toBe(
      1
    );
    await expect(usersService.findOneById(doomedUser.id)).rejects.toThrow();
  });

  it("should reject SUPER_ADMIN deletion", async () => {
    const admin = await usersService.createOne(testSuperAdminContext(), {
      name: "Admin",
      nickname: "admin-delete-test",
      email: "admin-delete-test@profile.info",
      password: "admin.123",
      role: UserRole.SUPER_ADMIN,
    });

    await expect(usersService.removeOne(admin.id)).rejects.toBeInstanceOf(
      ForbiddenException
    );
    await expect(usersService.findOneById(admin.id)).resolves.toMatchObject({
      id: admin.id,
      role: UserRole.SUPER_ADMIN,
    });
  });
});
