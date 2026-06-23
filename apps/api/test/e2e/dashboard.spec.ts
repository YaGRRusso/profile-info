import { INestApplication } from "@nestjs/common";
import { testRequestContext } from "@test/fixtures/request-context";
import { App } from "supertest/types";
import { UserRole } from "@/core/enums/user-role.enum";
import { CoursesService } from "@/modules/courses/courses.service";
import { CreateCourseInput } from "@/modules/courses/dto/create-course.input";
import { CourseStatus } from "@/modules/courses/enums/status.enum";
import { CreateEducationInput } from "@/modules/educations/dto/create-education.input";
import { EducationsService } from "@/modules/educations/educations.service";
import { EducationLevel } from "@/modules/educations/enums/level.enum";
import { EducationStatus } from "@/modules/educations/enums/status.enum";
import { OrganizationCategory } from "@/modules/organizations/enums/category.enum";
import { OrganizationsService } from "@/modules/organizations/organizations.service";
import { SkillCategory } from "@/modules/skills/enums/category.enum";
import { SkillsService } from "@/modules/skills/skills.service";
import { UsersService } from "@/modules/users/users.service";
import { clearTestDatabase } from "../support/clear-test-database";
import { createTestApp } from "../support/create-test-app";
import { graphqlRequest } from "../support/graphql-request";

describe("Dashboard (e2e)", () => {
  let app: INestApplication<App>;
  let adminToken: string;
  let userToken: string;
  let skillsService: SkillsService;
  let coursesService: CoursesService;
  let educationsService: EducationsService;
  let organizationsService: OrganizationsService;

  beforeAll(async () => {
    const testApp = await createTestApp();
    app = testApp.app;
    await clearTestDatabase(testApp.module);

    const usersService = testApp.module.get(UsersService);
    skillsService = testApp.module.get(SkillsService);
    coursesService = testApp.module.get(CoursesService);
    educationsService = testApp.module.get(EducationsService);
    organizationsService = testApp.module.get(OrganizationsService);

    await usersService.createOne({
      name: "Admin",
      nickname: "admin",
      email: "admin@profile.info",
      password: "pass.123",
      role: UserRole.SUPER_ADMIN,
    });

    const adminSignIn = await graphqlRequest<{ signIn: string }>(app, {
      query: `
        mutation SignIn($signInInput: SignInInput!) {
          signIn(signInInput: $signInInput)
        }
      `,
      variables: {
        signInInput: { email: "admin@profile.info", password: "pass.123" },
      },
    });

    adminToken = adminSignIn.data?.signIn ?? "";

    const user = await usersService.createOne({
      name: "User",
      nickname: "user",
      email: "user@profile.info",
      password: "user.123",
      role: UserRole.USER,
    });

    const userSignIn = await graphqlRequest<{ signIn: string }>(app, {
      query: `
        mutation SignIn($signInInput: SignInInput!) {
          signIn(signInInput: $signInInput)
        }
      `,
      variables: {
        signInInput: { email: "user@profile.info", password: "user.123" },
      },
    });

    userToken = userSignIn.data?.signIn ?? "";

    const organization = await organizationsService.createOne({
      slug: "dashboard-org",
      name: "Dashboard Org",
      website: "https://dashboard.example",
      logo: "https://dashboard.example/logo.png",
      category: OrganizationCategory.COMPANY,
      i18n: [{ locale: "en", messages: { description: "Org" } }],
    });

    await skillsService.createOne({
      slug: "dashboard-skill",
      name: "Dashboard Skill",
      category: SkillCategory.BACKEND,
    });

    const userCtx = testRequestContext({ userId: user._id.toString() });

    await coursesService.createOne(userCtx, {
      slug: "dashboard-course-complete",
      organizationId: organization._id.toString(),
      status: CourseStatus.COMPLETE,
      i18n: [
        {
          locale: "en",
          messages: { title: "Complete Course", description: "Done" },
        },
      ],
    } as CreateCourseInput);

    await coursesService.createOne(userCtx, {
      slug: "dashboard-course-progress",
      organizationId: organization._id.toString(),
      status: CourseStatus.IN_PROGRESS,
      i18n: [
        {
          locale: "en",
          messages: { title: "Progress Course", description: "Ongoing" },
        },
      ],
    } as CreateCourseInput);

    await educationsService.createOne(null, {
      slug: "dashboard-education",
      ownerId: user._id.toString(),
      organizationId: organization._id.toString(),
      level: EducationLevel.BACHELOR,
      status: EducationStatus.COMPLETE,
      i18n: [
        {
          locale: "en",
          messages: { title: "Bachelor Degree", description: "CS" },
        },
      ],
    } as CreateEducationInput & { ownerId: string });
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it("should return dashboard with totals, charts and recentActivity", async () => {
    const response = await graphqlRequest<{
      dashboard: {
        totals: {
          skills: number;
          courses: number;
          educations: number;
        };
        recentActivity: Array<{
          type: string;
          label: string;
          updatedAt: string;
        }>;
        skillsByCategory: Array<{ label: string; value: number }>;
        coursesByStatus: Array<{ label: string; value: number }>;
      };
    }>(app, {
      query: `
        query Dashboard {
          dashboard {
            totals {
              skills
              courses
              educations
            }
            recentActivity {
              type
              label
              updatedAt
            }
            skillsByCategory {
              label
              value
            }
            coursesByStatus {
              label
              value
            }
          }
        }
      `,
      token: adminToken,
    });

    expect(response.errors).toBeUndefined();

    const dashboard = response.data?.dashboard;
    expect(dashboard?.totals.skills).toBeGreaterThanOrEqual(1);
    expect(dashboard?.totals.courses).toBe(2);
    expect(dashboard?.totals.educations).toBeGreaterThanOrEqual(1);
    expect(dashboard?.recentActivity.length).toBeGreaterThanOrEqual(1);
    expect(dashboard?.recentActivity[0]?.label).toBeTruthy();
    expect(dashboard?.recentActivity[0]?.type).toBeTruthy();
    expect(dashboard?.skillsByCategory.length).toBeGreaterThanOrEqual(1);
    expect(dashboard?.coursesByStatus.length).toBeGreaterThanOrEqual(1);
  });

  it("should forbid non-admin users from dashboard query", async () => {
    const response = await graphqlRequest(app, {
      query: `
        query Dashboard {
          dashboard {
            totals {
              skills
            }
          }
        }
      `,
      token: userToken,
    });

    expect(response.errors?.[0]?.message).toContain("Insufficient permissions");
  });
});
