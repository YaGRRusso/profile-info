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
import { CreateEducationInput } from "@/modules/educations/dto/create-education.input";
import { EducationsService } from "@/modules/educations/educations.service";
import { EducationLevel } from "@/modules/educations/enums/level.enum";
import { EducationStatus } from "@/modules/educations/enums/status.enum";
import { CreateExperienceInput } from "@/modules/experiences/dto/create-experience.input";
import { ExperienceCategory } from "@/modules/experiences/enums/category.enum";
import { ExperiencesService } from "@/modules/experiences/experiences.service";
import { OrganizationCategory } from "@/modules/organizations/enums/category.enum";
import { OrganizationsService } from "@/modules/organizations/organizations.service";
import { SkillsService } from "@/modules/skills/skills.service";
import { UsersService } from "@/modules/users/users.service";
import { clearTestDatabase } from "../support/clear-test-database";
import { createTestApp } from "../support/create-test-app";
import { graphqlRequest } from "../support/graphql-request";
import { skillI18n } from "../support/skill-i18n";

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
        ownedLocalSkills
        ownedLocalOrganizations
      }
      coursesByStatus {
        label
        value
      }
      experiencesByCategory {
        label
        value
      }
    }
  }
`;

describe("Dashboard (e2e)", () => {
  let app: INestApplication<App>;
  let adminToken: string;
  let joaoToken: string;
  let mariaToken: string;
  let coursesService: CoursesService;
  let educationsService: EducationsService;
  let experiencesService: ExperiencesService;
  let organizationsService: OrganizationsService;
  let organizationId: string;

  beforeAll(async () => {
    const testApp = await createTestApp();
    ({ app } = testApp);
    await clearTestDatabase(testApp.module);

    const usersService = testApp.module.get(UsersService);
    const skillsService = testApp.module.get(SkillsService);
    coursesService = testApp.module.get(CoursesService);
    educationsService = testApp.module.get(EducationsService);
    experiencesService = testApp.module.get(ExperiencesService);
    organizationsService = testApp.module.get(OrganizationsService);

    await usersService.createOne(testSuperAdminContext(), {
      email: "admin@profile.info",
      name: "Admin",
      nickname: "admin",
      password: "123123",
      role: UserRole.SUPER_ADMIN,
    });

    const joao = await usersService.createOne(testSuperAdminContext(), {
      email: "joao@profile.info",
      name: "João",
      nickname: "joao",
      password: "123123",
      role: UserRole.USER,
    });

    const maria = await usersService.createOne(testSuperAdminContext(), {
      email: "maria@profile.info",
      name: "Maria",
      nickname: "maria",
      password: "123123",
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

    adminToken = await signIn("admin@profile.info", "123123");
    joaoToken = await signIn("joao@profile.info", "123123");
    mariaToken = await signIn("maria@profile.info", "123123");

    const organization = await organizationsService.createOne(
      testSuperAdminContext(),
      {
        category: OrganizationCategory.COMPANY,
        i18n: [{ locale: "en", messages: { description: "Org" } }],
        logo: "https://dashboard.example/logo.png",
        name: "Dashboard Org",
        slug: "dashboard-org",
        website: "https://dashboard.example",
      }
    );
    organizationId = organization.id;

    await skillsService.createOne(testSuperAdminContext(), {
      category: "Programming",
      i18n: skillI18n("Dashboard Skill"),
      slug: "dashboard-skill",
    });

    const joaoCtx = testAuthContext({ id: joao.id });
    const bobCtx = testAuthContext({ id: maria.id });

    await coursesService.createOne(joaoCtx, {
      i18n: [
        {
          locale: "en",
          messages: { description: "Done", title: "Alice Complete" },
        },
      ],
      organizationId,
      slug: "alice-course-complete",
      status: CourseStatus.COMPLETE,
    } as CreateCourseInput);

    await coursesService.createOne(joaoCtx, {
      i18n: [
        {
          locale: "en",
          messages: { description: "Ongoing", title: "Alice Progress" },
        },
      ],
      organizationId,
      slug: "alice-course-progress",
      status: CourseStatus.IN_PROGRESS,
    } as CreateCourseInput);

    await educationsService.createOne(joaoCtx, {
      i18n: [
        {
          locale: "en",
          messages: { description: "CS", title: "Alice Degree" },
        },
      ],
      level: EducationLevel.BACHELOR,
      organizationId,
      slug: "alice-education",
      status: EducationStatus.COMPLETE,
    } as CreateEducationInput);

    await experiencesService.createOne(joaoCtx, {
      category: ExperienceCategory.FULL_TIME,
      i18n: [
        {
          locale: "en",
          messages: { description: "Backend work", title: "Engineer" },
        },
      ],
      organizationId,
      slug: "alice-experience-full-time",
    } as CreateExperienceInput);

    await experiencesService.createOne(joaoCtx, {
      category: ExperienceCategory.FREELANCE,
      i18n: [
        {
          locale: "en",
          messages: { description: "Side projects", title: "Consultant" },
        },
      ],
      organizationId,
      slug: "alice-experience-freelance",
    } as CreateExperienceInput);

    await coursesService.createOne(bobCtx, {
      i18n: [
        {
          locale: "en",
          messages: { description: "Done", title: "Bob Course" },
        },
      ],
      organizationId,
      slug: "bob-course",
      status: CourseStatus.COMPLETE,
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
          ownedLocalSkills: number;
          ownedLocalOrganizations: number;
        };
        coursesByStatus: Array<{ label: string; value: number }>;
        experiencesByCategory: Array<{ label: string; value: number }>;
        skillsByCategory: Array<{ label: string; value: number }>;
      };
    }>(app, {
      query: DASHBOARD_QUERY,
      token: joaoToken,
    });

    expect(response.errors).toBeUndefined();

    const dashboard = response.data?.dashboard;
    expect(dashboard?.totals.courses).toBe(2);
    expect(dashboard?.totals.educations).toBe(1);
    expect(dashboard?.totals.projects).toBe(0);
    expect(dashboard?.totals.experiences).toBe(2);
    expect(dashboard?.totals.skills).toBe(1);
    expect(dashboard?.totals.organizations).toBe(1);
    expect(dashboard?.totals.ownedLocalSkills).toBe(0);
    expect(dashboard?.totals.ownedLocalOrganizations).toBe(0);
    expect(dashboard?.coursesByStatus).toEqual(
      expect.arrayContaining([
        { label: CourseStatus.COMPLETE, value: 1 },
        { label: CourseStatus.IN_PROGRESS, value: 1 },
      ])
    );
    expect(dashboard?.experiencesByCategory).toEqual(
      expect.arrayContaining([
        { label: ExperienceCategory.FULL_TIME, value: 1 },
        { label: ExperienceCategory.FREELANCE, value: 1 },
      ])
    );
  });

  it("should show another tenant only their private totals", async () => {
    const response = await graphqlRequest<{
      dashboard: { totals: { courses: number; educations: number } };
    }>(app, {
      query: DASHBOARD_QUERY,
      token: mariaToken,
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
