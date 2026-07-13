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
    app = testApp.app;
    await clearTestDatabase(testApp.module);

    const usersService = testApp.module.get(UsersService);
    const skillsService = testApp.module.get(SkillsService);
    coursesService = testApp.module.get(CoursesService);
    educationsService = testApp.module.get(EducationsService);
    experiencesService = testApp.module.get(ExperiencesService);
    organizationsService = testApp.module.get(OrganizationsService);

    await usersService.createOne(testSuperAdminContext(), {
      name: "Admin",
      nickname: "admin",
      email: "admin@profile.info",
      password: "123123",
      role: UserRole.SUPER_ADMIN,
    });

    const joao = await usersService.createOne(testSuperAdminContext(), {
      name: "João",
      nickname: "joao",
      email: "joao@profile.info",
      password: "123123",
      role: UserRole.USER,
    });

    const maria = await usersService.createOne(testSuperAdminContext(), {
      name: "Maria",
      nickname: "maria",
      email: "maria@profile.info",
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
        slug: "dashboard-org",
        name: "Dashboard Org",
        website: "https://dashboard.example",
        logo: "https://dashboard.example/logo.png",
        category: OrganizationCategory.COMPANY,
        i18n: [{ locale: "en", messages: { description: "Org" } }],
      }
    );
    organizationId = organization.id;

    await skillsService.createOne(testSuperAdminContext(), {
      slug: "dashboard-skill",
      i18n: skillI18n("Dashboard Skill"),
      category: "Programming",
    });

    const joaoCtx = testAuthContext({ id: joao.id });
    const bobCtx = testAuthContext({ id: maria.id });

    await coursesService.createOne(joaoCtx, {
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

    await coursesService.createOne(joaoCtx, {
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

    await educationsService.createOne(joaoCtx, {
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

    await experiencesService.createOne(joaoCtx, {
      slug: "alice-experience-full-time",
      organizationId,
      category: ExperienceCategory.FULL_TIME,
      roles: [
        {
          i18n: [
            {
              locale: "en",
              messages: { title: "Engineer", description: "Backend work" },
            },
          ],
        },
      ],
    } as CreateExperienceInput);

    await experiencesService.createOne(joaoCtx, {
      slug: "alice-experience-freelance",
      organizationId,
      category: ExperienceCategory.FREELANCE,
      roles: [
        {
          i18n: [
            {
              locale: "en",
              messages: { title: "Consultant", description: "Side projects" },
            },
          ],
        },
      ],
    } as CreateExperienceInput);

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
