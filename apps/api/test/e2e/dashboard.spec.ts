import { INestApplication } from "@nestjs/common";
import { testAuthContext } from "@test/fixtures/auth-context";
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

const DASHBOARD_QUERY = `
  query Dashboard {
    dashboard {
      totals {
        skills
        courses
        educations
        organizations
        projects
        experiences
      }
      coursesByStatus {
        label
        value
      }
      skillsByCategory {
        label
        value
      }
    }
  }
`;

describe("Dashboard (e2e)", () => {
  let app: INestApplication<App>;
  let adminToken: string;
  let aliceToken: string;
  let bobToken: string;
  let coursesService: CoursesService;
  let educationsService: EducationsService;
  let organizationsService: OrganizationsService;
  let organizationId: string;

  beforeAll(async () => {
    const testApp = await createTestApp();
    app = testApp.app;
    await clearTestDatabase(testApp.module);

    const usersService = testApp.module.get(UsersService);
    const skillsService = testApp.module.get(SkillsService);
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

    const alice = await usersService.createOne({
      name: "Alice",
      nickname: "alice",
      email: "alice@profile.info",
      password: "alice.pass",
      role: UserRole.USER,
    });

    const bob = await usersService.createOne({
      name: "Bob",
      nickname: "bob",
      email: "bob@profile.info",
      password: "bob.pass",
      role: UserRole.USER,
    });

    const signIn = async (email: string, password: string) => {
      const response = await graphqlRequest<{ signIn: string }>(app, {
        query: `
          mutation SignIn($signInInput: SignInInput!) {
            signIn(signInInput: $signInInput)
          }
        `,
        variables: { signInInput: { email, password } },
      });
      return response.data?.signIn ?? "";
    };

    adminToken = await signIn("admin@profile.info", "pass.123");
    aliceToken = await signIn("alice@profile.info", "alice.pass");
    bobToken = await signIn("bob@profile.info", "bob.pass");

    const organization = await organizationsService.createOne({
      slug: "dashboard-org",
      name: "Dashboard Org",
      website: "https://dashboard.example",
      logo: "https://dashboard.example/logo.png",
      category: OrganizationCategory.COMPANY,
      i18n: [{ locale: "en", messages: { description: "Org" } }],
    });
    organizationId = organization._id.toString();

    await skillsService.createOne({
      slug: "dashboard-skill",
      name: "Dashboard Skill",
      category: SkillCategory.BACKEND,
    });

    const aliceCtx = testAuthContext({ userId: alice._id.toString() });
    const bobCtx = testAuthContext({ userId: bob._id.toString() });

    await coursesService.createOne(aliceCtx, {
      slug: "alice-course-complete",
      organizationId,
      status: CourseStatus.COMPLETE,
      i18n: [
        {
          locale: "en",
          messages: { title: "Alice Complete", description: "Done" },
        },
      ],
    } as CreateCourseInput);

    await coursesService.createOne(aliceCtx, {
      slug: "alice-course-progress",
      organizationId,
      status: CourseStatus.IN_PROGRESS,
      i18n: [
        {
          locale: "en",
          messages: { title: "Alice Progress", description: "Ongoing" },
        },
      ],
    } as CreateCourseInput);

    await educationsService.createOne(aliceCtx, {
      slug: "alice-education",
      organizationId,
      level: EducationLevel.BACHELOR,
      status: EducationStatus.COMPLETE,
      i18n: [
        {
          locale: "en",
          messages: { title: "Alice Degree", description: "CS" },
        },
      ],
    } as CreateEducationInput);

    await coursesService.createOne(bobCtx, {
      slug: "bob-course",
      organizationId,
      status: CourseStatus.COMPLETE,
      i18n: [
        {
          locale: "en",
          messages: { title: "Bob Course", description: "Done" },
        },
      ],
    } as CreateCourseInput);
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it("should return UNAUTHENTICATED without a token", async () => {
    const response = await graphqlRequest(app, { query: DASHBOARD_QUERY });

    expect(response.errors?.[0]?.extensions?.code).toBe("UNAUTHENTICATED");
  });

  it("should scope private entity totals to the caller tenant for USER", async () => {
    const response = await graphqlRequest<{
      dashboard: {
        totals: {
          skills: number;
          courses: number;
          educations: number;
          organizations: number;
          projects: number;
          experiences: number;
        };
        coursesByStatus: Array<{ label: string; value: number }>;
        skillsByCategory: Array<{ label: string; value: number }>;
      };
    }>(app, {
      query: DASHBOARD_QUERY,
      token: aliceToken,
    });

    expect(response.errors).toBeUndefined();

    const dashboard = response.data?.dashboard;
    expect(dashboard?.totals.courses).toBe(2);
    expect(dashboard?.totals.educations).toBe(1);
    expect(dashboard?.totals.projects).toBe(0);
    expect(dashboard?.totals.experiences).toBe(0);
    expect(dashboard?.totals.skills).toBe(1);
    expect(dashboard?.totals.organizations).toBe(1);
    expect(dashboard?.totals.organizations).toBe(1);
    expect(dashboard?.coursesByStatus).toEqual(
      expect.arrayContaining([
        { label: CourseStatus.COMPLETE, value: 1 },
        { label: CourseStatus.IN_PROGRESS, value: 1 },
      ])
    );
    expect(dashboard?.skillsByCategory).toEqual([
      { label: SkillCategory.BACKEND, value: 1 },
    ]);
  });

  it("should show another tenant only their private totals", async () => {
    const response = await graphqlRequest<{
      dashboard: { totals: { courses: number; educations: number } };
    }>(app, {
      query: DASHBOARD_QUERY,
      token: bobToken,
    });

    expect(response.errors).toBeUndefined();
    expect(response.data?.dashboard.totals.courses).toBe(1);
    expect(response.data?.dashboard.totals.educations).toBe(0);
  });

  it("should show cross-tenant private totals for SUPER_ADMIN", async () => {
    const response = await graphqlRequest<{
      dashboard: {
        totals: {
          skills: number;
          courses: number;
          educations: number;
          organizations: number;
        };
      };
    }>(app, {
      query: DASHBOARD_QUERY,
      token: adminToken,
    });

    expect(response.errors).toBeUndefined();

    const dashboard = response.data?.dashboard;
    expect(dashboard?.totals.courses).toBe(3);
    expect(dashboard?.totals.educations).toBe(1);
    expect(dashboard?.totals.skills).toBe(1);
    expect(dashboard?.totals.organizations).toBe(1);
  });
});
