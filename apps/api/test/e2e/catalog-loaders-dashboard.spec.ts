import { INestApplication } from "@nestjs/common";
import {
  testAuthContext,
  testSuperAdminContext,
} from "@test/fixtures/auth-context";
import { App } from "supertest/types";
import { CatalogPartition } from "@/core/enums/catalog-partition.enum";
import { UserRole } from "@/core/enums/user-role.enum";
import { ExperienceCategory } from "@/modules/experiences/enums/category.enum";
import { ExperiencesService } from "@/modules/experiences/experiences.service";
import { OrganizationCategory } from "@/modules/organizations/enums/category.enum";
import { OrganizationsService } from "@/modules/organizations/organizations.service";
import { SkillsService } from "@/modules/skills/skills.service";
import { UsersService } from "@/modules/users/users.service";
import { clearTestDatabase } from "../support/clear-test-database";
import { createTestApp } from "../support/create-test-app";
import { graphqlRequest } from "../support/graphql-request";
import { organizationI18n } from "../support/organization-i18n";
import { skillI18n } from "../support/skill-i18n";

const EXPERIENCE_WITH_CATALOG = `
  query ExperienceWithCatalog($experienceId: ID!) {
    findOneExperienceById(experienceId: $experienceId) {
      id
      organization {
        id
        name
        partition
      }
      skills {
        id
        slug
        disabled
      }
    }
  }
`;

const DASHBOARD_TOTALS = `
  query DashboardTotals {
    dashboard {
      totals {
        skills
        organizations
      }
    }
  }
`;

async function signIn(
  app: INestApplication<App>,
  email: string,
  password: string
): Promise<string> {
  const response = await graphqlRequest<{ signIn: string }>(app, {
    query: `
      mutation SignIn($signInInput: SignInInput!) {
        signIn(signInInput: $signInInput)
      }
    `,
    variables: { signInInput: { email, password } },
  });

  return response.data?.signIn ?? "";
}

describe("Catalog loaders and dashboard counts (e2e)", () => {
  let app: INestApplication<App>;
  let skillsService: SkillsService;
  let organizationsService: OrganizationsService;
  let experiencesService: ExperiencesService;
  let userAToken: string;
  let userAId: string;
  let userBLocalSkillId: string;
  let experienceWithLocalOrgId: string;
  let localOrgName: string;

  beforeAll(async () => {
    const testApp = await createTestApp();
    app = testApp.app;
    await clearTestDatabase(testApp.module);

    const usersService = testApp.module.get(UsersService);
    skillsService = testApp.module.get(SkillsService);
    organizationsService = testApp.module.get(OrganizationsService);
    experiencesService = testApp.module.get(ExperiencesService);

    await usersService.createOne(testSuperAdminContext(), {
      name: "Admin",
      nickname: "admin",
      email: "admin@profile.info",
      password: "123123",
      role: UserRole.SUPER_ADMIN,
    });

    const userA = await usersService.createOne(testSuperAdminContext(), {
      name: "User A",
      nickname: "user-a",
      email: "user-a@profile.info",
      password: "user-a.123",
      role: UserRole.USER,
    });
    userAId = userA.id;

    const userB = await usersService.createOne(testSuperAdminContext(), {
      name: "User B",
      nickname: "user-b",
      email: "user-b@profile.info",
      password: "user-b.123",
      role: UserRole.USER,
    });

    userAToken = await signIn(app, "user-a@profile.info", "user-a.123");
    const adminToken = await signIn(app, "admin@profile.info", "123123");

    await skillsService.createOne(testSuperAdminContext(), {
      slug: "loader-global-active",
      i18n: skillI18n("Loader Global Active"),
      category: "Programming",
    });

    const disabledGlobal = await skillsService.createOne(
      testSuperAdminContext(),
      {
        slug: "loader-global-disabled",
        i18n: skillI18n("Loader Global Disabled"),
        category: "Programming",
      }
    );
    disabledGlobalSkillId = disabledGlobal.id;
    await skillsService.disableOne(testSuperAdminContext(), disabledGlobal.id);

    await skillsService.createOne(testAuthContext({ id: userAId }), {
      slug: "loader-user-a-local",
      i18n: skillI18n("Loader User A Local"),
      category: "Programming",
    });

    const userBLocalSkill = await skillsService.createOne(
      testAuthContext({ id: userB.id }),
      {
        slug: "loader-user-b-local",
        i18n: skillI18n("Loader User B Local"),
        category: "Programming",
      }
    );
    userBLocalSkillId = userBLocalSkill.id;

    await organizationsService.createOne(testSuperAdminContext(), {
      slug: "loader-global-org",
      name: "Loader Global Org",
      website: "https://loader-global.example",
      logo: "https://loader-global.example/logo.png",
      category: OrganizationCategory.COMPANY,
      i18n: organizationI18n("Global org"),
    });

    const localOrg = await organizationsService.createOne(
      testAuthContext({ id: userAId }),
      {
        slug: "loader-user-a-local-org",
        name: "User A Local Org",
        website: "https://user-a-local.example",
        logo: "https://user-a-local.example/logo.png",
        category: OrganizationCategory.COMPANY,
        i18n: organizationI18n("Local org"),
      }
    );
    localOrgName = localOrg.name;

    const skillOnExperience = await skillsService.createOne(
      testSuperAdminContext(),
      {
        slug: "loader-disabled-on-experience",
        i18n: skillI18n("Disabled On Experience"),
        category: "Programming",
      }
    );

    const userACtx = testAuthContext({ id: userAId });
    const experience = await experiencesService.createOne(userACtx, {
      slug: "loader-local-org-experience",
      organizationId: localOrg.id,
      category: ExperienceCategory.FREELANCE,
      roles: [
        {
          i18n: [
            {
              locale: "en",
              messages: {
                title: "Freelancer",
                description: "Local org work",
              },
            },
          ],
          skillIds: [skillOnExperience.id],
        },
      ],
    });
    experienceWithLocalOrgId = experience.id;

    await skillsService.disableOne(
      testSuperAdminContext(),
      skillOnExperience.id
    );

    // Warm admin session for dashboard disabled-org setup below
    await graphqlRequest(app, { query: DASHBOARD_TOTALS, token: adminToken });
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it("resolves LOCAL organization and disabled skills on owned experience", async () => {
    const response = await graphqlRequest<{
      findOneExperienceById: {
        organization: { name: string; partition: CatalogPartition };
        skills: Array<{ slug: string; disabled: boolean }>;
      };
    }>(app, {
      query: EXPERIENCE_WITH_CATALOG,
      variables: { experienceId: experienceWithLocalOrgId },
      token: userAToken,
    });

    expect(response.errors).toBeUndefined();
    expect(response.data?.findOneExperienceById.organization).toMatchObject({
      name: localOrgName,
      partition: CatalogPartition.LOCAL,
    });
    expect(response.data?.findOneExperienceById.skills).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          slug: "loader-disabled-on-experience",
          disabled: true,
        }),
      ])
    );
  });

  it("returns empty findManySkillById for out-of-scope skill IDs", async () => {
    const response = await graphqlRequest<{
      findManySkillById: Array<{ id: string }>;
    }>(app, {
      query: `
        query FindManySkillById($skillIds: [ID!]!) {
          findManySkillById(skillIds: $skillIds) { id }
        }
      `,
      variables: { skillIds: [userBLocalSkillId] },
      token: userAToken,
    });

    expect(response.errors).toBeUndefined();
    expect(response.data?.findManySkillById).toEqual([]);
  });

  it("excludes disabled catalog rows from dashboard totals for USER", async () => {
    const response = await graphqlRequest<{
      dashboard: { totals: { skills: number; organizations: number } };
    }>(app, {
      query: DASHBOARD_TOTALS,
      token: userAToken,
    });

    expect(response.errors).toBeUndefined();
    expect(response.data?.dashboard.totals.skills).toBe(2);
    expect(response.data?.dashboard.totals.organizations).toBe(2);
  });

  it("counts all active catalog rows for SUPER_ADMIN including every users LOCAL", async () => {
    const adminToken = await signIn(app, "admin@profile.info", "123123");

    const response = await graphqlRequest<{
      dashboard: { totals: { skills: number; organizations: number } };
    }>(app, {
      query: DASHBOARD_TOTALS,
      token: adminToken,
    });

    expect(response.errors).toBeUndefined();
    expect(response.data?.dashboard.totals.skills).toBe(3);
    expect(response.data?.dashboard.totals.organizations).toBe(2);
  });

  it("findOneActiveSkill rejects disabled skills", async () => {
    const response = await graphqlRequest(app, {
      query: `
        query FindOneActiveSkill($skillFilters: FilterSkillInput) {
          findOneActiveSkill(skillFilters: $skillFilters) { id }
        }
      `,
      variables: { skillFilters: { slug: "loader-global-disabled" } },
      token: userAToken,
    });

    expect(response.errors?.[0]?.message).toContain("Not Found");
  });
});
