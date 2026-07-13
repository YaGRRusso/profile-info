import { INestApplication } from "@nestjs/common";
import { testSuperAdminContext } from "@test/fixtures/auth-context";
import { App } from "supertest/types";
import { UserRole } from "@/core/enums/user-role.enum";
import { OrganizationCategory } from "@/modules/organizations/enums/category.enum";
import { OrganizationsService } from "@/modules/organizations/organizations.service";
import { SkillsService } from "@/modules/skills/skills.service";
import { UsersService } from "@/modules/users/users.service";
import { clearTestDatabase } from "../support/clear-test-database";
import { createTestApp } from "../support/create-test-app";
import { graphqlRequest } from "../support/graphql-request";
import { skillI18n } from "../support/skill-i18n";

const FIND_MANY_SKILLS = `
  query FindManySkills {
    findManySkills {
      found
      nodes {
        id
        slug
      }
    }
  }
`;

const FIND_MANY_ORGANIZATIONS = `
  query FindManyOrganizations {
    findManyOrganizations {
      found
      nodes {
        id
        name
      }
    }
  }
`;

const FIND_MANY_USERS = `
  query FindManyUsers {
    findManyUsers {
      found
      nodes {
        id
        email
      }
    }
  }
`;

const FIND_ONE_USER = `
  query FindOneUser($userFilters: FilterUserInput) {
    findOneUser(userFilters: $userFilters) {
      id
      email
    }
  }
`;

describe("Catalog reads (e2e)", () => {
  let app: INestApplication<App>;
  let userToken: string;

  beforeAll(async () => {
    const testApp = await createTestApp();
    app = testApp.app;
    await clearTestDatabase(testApp.module);

    const usersService = testApp.module.get(UsersService);
    const skillsService = testApp.module.get(SkillsService);
    const organizationsService = testApp.module.get(OrganizationsService);

    await usersService.createOne(testSuperAdminContext(), {
      name: "Admin",
      nickname: "admin",
      email: "admin@profile.info",
      password: "123123",
      role: UserRole.SUPER_ADMIN,
    });

    await usersService.createOne(testSuperAdminContext(), {
      name: "João",
      nickname: "joao",
      email: "joao@profile.info",
      password: "123123",
      role: UserRole.USER,
    });

    await organizationsService.createOne(testSuperAdminContext(), {
      slug: "catalog-org",
      name: "Catalog Org",
      website: "https://catalog.example",
      logo: "https://catalog.example/logo.png",
      category: OrganizationCategory.COMPANY,
      i18n: [{ locale: "en", messages: { description: "Catalog org" } }],
    });

    await skillsService.createOne(testSuperAdminContext(), {
      slug: "catalog-skill",
      i18n: skillI18n("Catalog Skill"),
      category: "Programming",
    });

    const signIn = await graphqlRequest<{ signIn: string }>(app, {
      query: `
        mutation SignIn($signInInput: SignInInput!) {
          signIn(signInInput: $signInInput)
        }
      `,
      variables: {
        signInInput: { email: "joao@profile.info", password: "123123" },
      },
    });

    userToken = signIn.data?.signIn ?? "";
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it.each([
    ["findManySkills", FIND_MANY_SKILLS],
    ["findManyOrganizations", FIND_MANY_ORGANIZATIONS],
    ["findManyUsers", FIND_MANY_USERS],
  ])("should return UNAUTHENTICATED for %s without a token", async (_, query) => {
    const response = await graphqlRequest(app, { query });

    expect(response.errors?.[0]?.extensions?.code).toBe("UNAUTHENTICATED");
  });

  it("should allow authenticated USER to read catalog lists", async () => {
    const [skills, organizations] = await Promise.all([
      graphqlRequest<{
        findManySkills: { found: number };
      }>(app, { query: FIND_MANY_SKILLS, token: userToken }),
      graphqlRequest<{
        findManyOrganizations: { found: number };
      }>(app, { query: FIND_MANY_ORGANIZATIONS, token: userToken }),
    ]);

    expect(skills.errors).toBeUndefined();
    expect(skills.data?.findManySkills.found).toBe(1);
    expect(organizations.errors).toBeUndefined();
    expect(organizations.data?.findManyOrganizations.found).toBe(1);
  });

  it("should forbid USER from filter-based user reads", async () => {
    const [many, one] = await Promise.all([
      graphqlRequest(app, {
        query: FIND_MANY_USERS,
        token: userToken,
      }),
      graphqlRequest(app, {
        query: FIND_ONE_USER,
        token: userToken,
        variables: { userFilters: { email: "admin@profile.info" } },
      }),
    ]);

    expect(many.data?.findManyUsers).toBeUndefined();
    expect(many.errors?.[0]?.extensions?.code).toBe("FORBIDDEN");
    expect(one.data?.findOneUser).toBeUndefined();
    expect(one.errors?.[0]?.extensions?.code).toBe("FORBIDDEN");
  });

  it("should allow SUPER_ADMIN filter-based user reads", async () => {
    const adminSignIn = await graphqlRequest<{ signIn: string }>(app, {
      query: `
        mutation SignIn($signInInput: SignInInput!) {
          signIn(signInInput: $signInInput)
        }
      `,
      variables: {
        signInInput: { email: "admin@profile.info", password: "123123" },
      },
    });
    const adminToken = adminSignIn.data?.signIn ?? "";

    const [many, one] = await Promise.all([
      graphqlRequest<{
        findManyUsers: { found: number };
      }>(app, {
        query: FIND_MANY_USERS,
        token: adminToken,
      }),
      graphqlRequest<{
        findOneUser: { email: string };
      }>(app, {
        query: FIND_ONE_USER,
        token: adminToken,
        variables: { userFilters: { email: "joao@profile.info" } },
      }),
    ]);

    expect(many.errors).toBeUndefined();
    expect(many.data?.findManyUsers.found).toBeGreaterThanOrEqual(2);
    expect(one.errors).toBeUndefined();
    expect(one.data?.findOneUser.email).toBe("joao@profile.info");
  });
});
