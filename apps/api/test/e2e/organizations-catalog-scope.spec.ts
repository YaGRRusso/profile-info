import { INestApplication } from "@nestjs/common";
import {
  testAuthContext,
  testSuperAdminContext,
} from "@test/fixtures/auth-context";
import { App } from "supertest/types";
import { CatalogPartition } from "@/core/enums/catalog-partition.enum";
import { UserRole } from "@/core/enums/user-role.enum";
import { OrganizationCategory } from "@/modules/organizations/enums/category.enum";
import { OrganizationsService } from "@/modules/organizations/organizations.service";
import { UsersService } from "@/modules/users/users.service";
import { clearTestDatabase } from "../support/clear-test-database";
import { createTestApp } from "../support/create-test-app";
import { graphqlRequest } from "../support/graphql-request";
import { organizationI18n } from "../support/organization-i18n";

const MUTATION_BLOCKED_MESSAGE = /Not (found|updated|removed)/;

function firstGraphqlErrorMessage(
  errors: Array<{ message: string }> | undefined
): string {
  return errors?.[0]?.message ?? "";
}

function buildOrganizationInput(slug: string, name: string) {
  return {
    category: OrganizationCategory.COMPANY,
    i18n: organizationI18n(`${name} description`),
    logo: `https://${slug}.example/logo.png`,
    name,
    slug,
    website: `https://${slug}.example`,
  };
}

function buildCourseInput(slug: string, organizationId: string) {
  return {
    i18n: [
      {
        locale: "en",
        messages: {
          description: "Course description",
          title: "Course title",
        },
      },
    ],
    organizationId,
    relevance: 1,
    slug,
    status: "COMPLETE",
  };
}

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

describe("Organizations catalog scope (e2e)", () => {
  let app: INestApplication<App>;
  let organizationsService: OrganizationsService;
  let adminToken: string;
  let userAToken: string;
  let userAId: string;
  let userBId: string;
  let globalOrganizationId: string;
  let userBLocalOrganizationId: string;
  let userBLocalSlug: string;

  beforeAll(async () => {
    const testApp = await createTestApp();
    ({ app } = testApp);
    await clearTestDatabase(testApp.module);

    const usersService = testApp.module.get(UsersService);
    organizationsService = testApp.module.get(OrganizationsService);

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
    userBId = userB.id;

    adminToken = await signIn(app, "admin@profile.info", "123123");
    userAToken = await signIn(app, "user-a@profile.info", "user-a.123");

    const globalOrganization = await organizationsService.createOne(
      testSuperAdminContext(),
      buildOrganizationInput("scope-global-org", "Scope Global")
    );
    globalOrganizationId = globalOrganization.id;

    userBLocalSlug = "user-b-local-org";
    const userBLocalOrganization = await organizationsService.createOne(
      testAuthContext({ id: userBId }),
      buildOrganizationInput(userBLocalSlug, "User B Local")
    );
    userBLocalOrganizationId = userBLocalOrganization.id;
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it("1 — USER creates a LOCAL catalog organization with partition LOCAL", async () => {
    const response = await graphqlRequest<{
      createOneOrganization: { slug: string; partition: CatalogPartition };
    }>(app, {
      query: `
        mutation CreateOneOrganization($createOrganizationInput: CreateOrganizationInput!) {
          createOneOrganization(createOrganizationInput: $createOrganizationInput) {
            slug
            partition
          }
        }
      `,
      token: userAToken,
      variables: {
        createOrganizationInput: buildOrganizationInput(
          "user-a-local-org",
          "User A Local"
        ),
      },
    });

    expect(response.errors).toBeUndefined();
    expect(response.data?.createOneOrganization.slug).toBe("user-a-local-org");
    expect(response.data?.createOneOrganization.partition).toBe(
      CatalogPartition.LOCAL
    );
  });

  it("2 — USER cannot disable, update, or remove a GLOBAL catalog organization", async () => {
    const disableResponse = await graphqlRequest(app, {
      query: `
        mutation DisableOneOrganization($organizationId: ID!) {
          disableOneOrganization(organizationId: $organizationId) { id }
        }
      `,
      token: userAToken,
      variables: { organizationId: globalOrganizationId },
    });
    expect(firstGraphqlErrorMessage(disableResponse.errors)).toMatch(
      MUTATION_BLOCKED_MESSAGE
    );

    const updateResponse = await graphqlRequest(app, {
      query: `
        mutation UpdateOneOrganization($organizationId: ID!, $updateOrganizationInput: UpdateOrganizationInput!) {
          updateOneOrganization(organizationId: $organizationId, updateOrganizationInput: $updateOrganizationInput) {
            id
          }
        }
      `,
      token: userAToken,
      variables: {
        organizationId: globalOrganizationId,
        updateOrganizationInput: { slug: "hijacked-global" },
      },
    });
    expect(firstGraphqlErrorMessage(updateResponse.errors)).toMatch(
      MUTATION_BLOCKED_MESSAGE
    );

    const removeResponse = await graphqlRequest(app, {
      query: `
        mutation RemoveOneOrganization($organizationId: ID!) {
          removeOneOrganization(organizationId: $organizationId) { id }
        }
      `,
      token: userAToken,
      variables: { organizationId: globalOrganizationId },
    });
    expect(firstGraphqlErrorMessage(removeResponse.errors)).toMatch(
      MUTATION_BLOCKED_MESSAGE
    );
  });

  it("3 — USER A cannot read USER B LOCAL via findOneById, findManyById, or findManyOrganizations", async () => {
    const findOneById = await graphqlRequest(app, {
      query: `
        query FindOneOrganizationById($organizationId: ID!) {
          findOneOrganizationById(organizationId: $organizationId) { id slug }
        }
      `,
      token: userAToken,
      variables: { organizationId: userBLocalOrganizationId },
    });
    expect(findOneById.errors?.[0]?.message).toContain("Not found");

    const findManyById = await graphqlRequest<{
      findManyOrganizationById: Array<{ id: string; slug: string }>;
    }>(app, {
      query: `
        query FindManyOrganizationById($organizationIds: [ID!]!) {
          findManyOrganizationById(organizationIds: $organizationIds) { id slug }
        }
      `,
      token: userAToken,
      variables: { organizationIds: [userBLocalOrganizationId] },
    });
    expect(findManyById.errors).toBeUndefined();
    expect(findManyById.data?.findManyOrganizationById).toEqual([]);

    const findManyOrganizations = await graphqlRequest<{
      findManyOrganizations: { found: number; nodes: Array<{ slug: string }> };
    }>(app, {
      query: `
        query FindManyOrganizations($organizationFilters: FilterOrganizationInput) {
          findManyOrganizations(organizationFilters: $organizationFilters) {
            found
            nodes { slug }
          }
        }
      `,
      token: userAToken,
      variables: {
        organizationFilters: {
          partition: CatalogPartition.LOCAL,
          slug: userBLocalSlug,
        },
      },
    });
    expect(findManyOrganizations.errors).toBeUndefined();
    expect(findManyOrganizations.data?.findManyOrganizations.found).toBe(0);
    expect(findManyOrganizations.data?.findManyOrganizations.nodes).toEqual([]);
  });

  it("4 — SUPER_ADMIN reads GLOBAL and all users LOCAL organizations", async () => {
    const response = await graphqlRequest<{
      findManyOrganizations: {
        nodes: Array<{ slug: string; partition: CatalogPartition }>;
      };
    }>(app, {
      query: `
        query FindManyOrganizations {
          findManyOrganizations {
            nodes { slug partition }
          }
        }
      `,
      token: adminToken,
    });

    expect(response.errors).toBeUndefined();
    const slugs = response.data?.findManyOrganizations.nodes.map(
      (node) => node.slug
    );
    expect(slugs).toContain("scope-global-org");
    expect(slugs).toContain("user-a-local-org");
    expect(slugs).toContain(userBLocalSlug);
  });

  it("5 — SUPER_ADMIN cannot mutate another users LOCAL organization", async () => {
    const response = await graphqlRequest(app, {
      query: `
        mutation DisableOneOrganization($organizationId: ID!) {
          disableOneOrganization(organizationId: $organizationId) { id }
        }
      `,
      token: adminToken,
      variables: { organizationId: userBLocalOrganizationId },
    });

    expect(firstGraphqlErrorMessage(response.errors)).toMatch(
      MUTATION_BLOCKED_MESSAGE
    );
  });

  it("6 — SUPER_ADMIN creates, updates, and disables a GLOBAL catalog organization", async () => {
    const createResponse = await graphqlRequest<{
      createOneOrganization: {
        id: string;
        slug: string;
        partition: CatalogPartition;
      };
    }>(app, {
      query: `
        mutation CreateOneOrganization($createOrganizationInput: CreateOrganizationInput!) {
          createOneOrganization(createOrganizationInput: $createOrganizationInput) {
            id
            slug
            partition
          }
        }
      `,
      token: adminToken,
      variables: {
        createOrganizationInput: buildOrganizationInput(
          "admin-global-org",
          "Admin Global"
        ),
      },
    });

    expect(createResponse.errors).toBeUndefined();
    expect(createResponse.data?.createOneOrganization.partition).toBe(
      CatalogPartition.GLOBAL
    );

    const organizationId = createResponse.data?.createOneOrganization.id ?? "";

    const updateResponse = await graphqlRequest<{
      updateOneOrganization: { slug: string };
    }>(app, {
      query: `
        mutation UpdateOneOrganization($organizationId: ID!, $updateOrganizationInput: UpdateOrganizationInput!) {
          updateOneOrganization(organizationId: $organizationId, updateOrganizationInput: $updateOrganizationInput) {
            slug
          }
        }
      `,
      token: adminToken,
      variables: {
        organizationId,
        updateOrganizationInput: { slug: "admin-global-renamed" },
      },
    });
    expect(updateResponse.errors).toBeUndefined();
    expect(updateResponse.data?.updateOneOrganization.slug).toBe(
      "admin-global-renamed"
    );

    const disableResponse = await graphqlRequest<{
      disableOneOrganization: { id: string };
    }>(app, {
      query: `
        mutation DisableOneOrganization($organizationId: ID!) {
          disableOneOrganization(organizationId: $organizationId) { id }
        }
      `,
      token: adminToken,
      variables: { organizationId },
    });
    expect(disableResponse.errors).toBeUndefined();
    expect(disableResponse.data?.disableOneOrganization.id).toBe(
      organizationId
    );
  });

  it("7 — findManyActiveOrganizations excludes disabled organizations in caller scope", async () => {
    const disabledOrganization = await organizationsService.createOne(
      testSuperAdminContext(),
      buildOrganizationInput("scope-disabled-org", "Scope Disabled")
    );

    await organizationsService.disableOne(
      testSuperAdminContext(),
      disabledOrganization.id
    );

    const browseResponse = await graphqlRequest<{
      findManyOrganizations: { nodes: Array<{ slug: string }> };
    }>(app, {
      query: `
        query FindManyOrganizations($organizationFilters: FilterOrganizationInput) {
          findManyOrganizations(organizationFilters: $organizationFilters) {
            nodes { slug }
          }
        }
      `,
      token: userAToken,
      variables: { organizationFilters: { slug: "scope-disabled-org" } },
    });
    expect(browseResponse.errors).toBeUndefined();
    expect(browseResponse.data?.findManyOrganizations.nodes).toHaveLength(1);

    const activeResponse = await graphqlRequest<{
      findManyActiveOrganizations: {
        found: number;
        nodes: Array<{ slug: string }>;
      };
    }>(app, {
      query: `
        query FindManyActiveOrganizations($organizationFilters: FilterOrganizationInput) {
          findManyActiveOrganizations(organizationFilters: $organizationFilters) {
            found
            nodes { slug }
          }
        }
      `,
      token: userAToken,
      variables: { organizationFilters: { slug: "scope-disabled-org" } },
    });
    expect(activeResponse.errors).toBeUndefined();
    expect(activeResponse.data?.findManyActiveOrganizations.found).toBe(0);
    expect(activeResponse.data?.findManyActiveOrganizations.nodes).toEqual([]);
  });

  it("8 — assertOrganizationsEnabled blocks attaching a disabled organization via createOneCourse", async () => {
    const disabledOrganization = await organizationsService.createOne(
      testSuperAdminContext(),
      buildOrganizationInput("attach-disabled-org", "Attach Disabled")
    );

    await organizationsService.disableOne(
      testSuperAdminContext(),
      disabledOrganization.id
    );

    const response = await graphqlRequest(app, {
      query: `
        mutation CreateOneCourse($createCourseInput: CreateCourseInput!) {
          createOneCourse(createCourseInput: $createCourseInput) { id }
        }
      `,
      token: userAToken,
      variables: {
        createCourseInput: buildCourseInput(
          "attach-disabled-org-course",
          disabledOrganization.id
        ),
      },
    });

    expect(response.errors?.[0]?.message).toContain("Not found");
  });

  it("9 — FilterOrganizationInput with another users ownerId and LOCAL does not leak", async () => {
    const userBToken = await signIn(app, "user-b@profile.info", "user-b.123");

    const response = await graphqlRequest<{
      findManyOrganizations: { found: number; nodes: Array<{ slug: string }> };
    }>(app, {
      query: `
        query FindManyOrganizations($organizationFilters: FilterOrganizationInput) {
          findManyOrganizations(organizationFilters: $organizationFilters) {
            found
            nodes { slug }
          }
        }
      `,
      token: userBToken,
      variables: {
        organizationFilters: {
          ownerId: userAId,
          partition: CatalogPartition.LOCAL,
          slug: "user-a-local-org",
        },
      },
    });

    expect(response.errors).toBeUndefined();
    expect(response.data?.findManyOrganizations.found).toBe(0);
    expect(response.data?.findManyOrganizations.nodes).toEqual([]);
  });
});
