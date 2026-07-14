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
    ({ app } = testApp);
    await clearTestDatabase(testApp.module);

    const usersService = testApp.module.get(UsersService);
    skillsService = testApp.module.get(SkillsService);
    organizationsService = testApp.module.get(OrganizationsService);
    experiencesService = testApp.module.get(ExperiencesService);

    await usersService.createOne(testSuperAdminContext(), {
      email: "admin@profile.info",
      name: "Admin",
      nickname: "admin",
      password: "123123",
      role: UserRole.SUPER_ADMIN,
    });

    const userA = await usersService.createOne(testSuperAdminContext(), {
      email: "user-a@profile.info",
      name: "User A",
      nickname: "user-a",
      password: "user-a.123",
      role: UserRole.USER,
    });
    userAId = userA.id;

    const userB = await usersService.createOne(testSuperAdminContext(), {
      email: "user-b@profile.info",
      name: "User B",
      nickname: "user-b",
      password: "user-b.123",
      role: UserRole.USER,
    });

    userAToken = await signIn(app, "user-a@profile.info", "user-a.123");
    const adminToken = await signIn(app, "admin@profile.info", "123123");

    await skillsService.createOne(testSuperAdminContext(), {
      category: "Programming",
      i18n: skillI18n("Loader Global Active"),
      slug: "loader-global-active",
    });

    const disabledGlobal = await skillsService.createOne(
      testSuperAdminContext(),
      {
        category: "Programming",
        i18n: skillI18n("Loader Global Disabled"),
        slug: "loader-global-disabled",
      }
    );
    disabledGlobalSkillId = disabledGlobal.id;
    await skillsService.disableOne(testSuperAdminContext(), disabledGlobal.id);

    await skillsService.createOne(testAuthContext({ id: userAId }), {
      category: "Programming",
      i18n: skillI18n("Loader User A Local"),
      slug: "loader-user-a-local",
    });

    const userBLocalSkill = await skillsService.createOne(
      testAuthContext({ id: userB.id }),
      {
        category: "Programming",
        i18n: skillI18n("Loader User B Local"),
        slug: "loader-user-b-local",
      }
    );
    userBLocalSkillId = userBLocalSkill.id;

    await organizationsService.createOne(testSuperAdminContext(), {
      category: OrganizationCategory.COMPANY,
      i18n: organizationI18n("Global org"),
      logo: "https://loader-global.example/logo.png",
      name: "Loader Global Org",
      slug: "loader-global-org",
      website: "https://loader-global.example",
    });

    const localOrg = await organizationsService.createOne(
      testAuthContext({ id: userAId }),
      {
        category: OrganizationCategory.COMPANY,
        i18n: organizationI18n("Local org"),
        logo: "https://user-a-local.example/logo.png",
        name: "User A Local Org",
        slug: "loader-user-a-local-org",
        website: "https://user-a-local.example",
      }
    );
    localOrgName = localOrg.name;

    const skillOnExperience = await skillsService.createOne(
      testSuperAdminContext(),
      {
        category: "Programming",
        i18n: skillI18n("Disabled On Experience"),
        slug: "loader-disabled-on-experience",
      }
    );

    const userACtx = testAuthContext({ id: userAId });
    const experience = await experiencesService.createOne(userACtx, {
      category: ExperienceCategory.FREELANCE,
      organizationId: localOrg.id,
      roles: [
        {
          i18n: [
            {
              locale: "en",
              messages: {
                description: "Local org work",
                title: "Freelancer",
              },
            },
          ],
          skillIds: [skillOnExperience.id],
        },
      ],
      slug: "loader-local-org-experience",
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
      token: userAToken,
      variables: { experienceId: experienceWithLocalOrgId },
    });

    expect(response.errors).toBeUndefined();
    expect(response.data?.findOneExperienceById.organization).toMatchObject({
      name: localOrgName,
      partition: CatalogPartition.LOCAL,
    });
    expect(response.data?.findOneExperienceById.skills).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          disabled: true,
          slug: "loader-disabled-on-experience",
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
      token: userAToken,
      variables: { skillIds: [userBLocalSkillId] },
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
      token: userAToken,
      variables: { skillFilters: { slug: "loader-global-disabled" } },
    });

    expect(response.errors?.[0]?.message).toContain("Not Found");
  });
});
