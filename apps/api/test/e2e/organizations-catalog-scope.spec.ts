import { INestApplication } from "@nestjs/common";
import {
  testAuthContext,
  testSuperAdminContext,
} from "@test/fixtures/auth-context";
import { App } from "supertest/types";
import { CatalogPartition } from "@/core/enums/catalog-partition.enum";
import { UserRole } from "@/core/enums/user-role.enum";
import { PERSISTENCE_NOT_FOUND } from "@/core/persistence/persistence.messages";
import { OrganizationCategory } from "@/modules/organizations/enums/category.enum";
import { OrganizationsService } from "@/modules/organizations/organizations.service";
import { UsersService } from "@/modules/users/users.service";
import { clearTestDatabase } from "../support/clear-test-database";
import { createTestApp } from "../support/create-test-app";
import { graphqlRequest } from "../support/graphql-request";
import { organizationI18n } from "../support/organization-i18n";

const MUTATION_BLOCKED_MESSAGE = /Not (Found|Updated|Removed)/;

function firstGraphqlErrorMessage(
  errors: Array<{ message: string }> | undefined
): string {
  return errors?.[0]?.message ?? "";
}

function buildOrganizationInput(slug: string, name: string) {
  return {
    slug,
    name,
    website: `https://${slug}.example`,
    logo: `https://${slug}.example/logo.png`,
    category: OrganizationCategory.COMPANY,
    i18n: organizationI18n(`${name} description`),
  };
}

function buildCourseInput(slug: string, organizationId: string) {
  return {
    slug,
    organizationId,
    status: "COMPLETE",
    relevance: 1,
    i18n: [
      {
        locale: "en",
        messages: {
          title: "Course title",
          description: "Course description",
        },
      },
    ],
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
    app = testApp.app;
    await clearTestDatabase(testApp.module);

    const usersService = testApp.module.get(UsersService);
    organizationsService = testApp.module.get(OrganizationsService);

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
      variables: {
        createOrganizationInput: buildOrganizationInput(
          "user-a-local-org",
          "User A Local"
        ),
      },
      token: userAToken,
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
      variables: { organizationId: globalOrganizationId },
      token: userAToken,
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
      variables: {
        organizationId: globalOrganizationId,
        updateOrganizationInput: { slug: "hijacked-global" },
      },
      token: userAToken,
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
      variables: { organizationId: globalOrganizationId },
      token: userAToken,
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
      variables: { organizationId: userBLocalOrganizationId },
      token: userAToken,
    });
    expect(findOneById.errors?.[0]?.message).toContain("Not Found");

    const findManyById = await graphqlRequest<{
      findManyOrganizationById: Array<{ id: string; slug: string }>;
    }>(app, {
      query: `
        query FindManyOrganizationById($organizationIds: [ID!]!) {
          findManyOrganizationById(organizationIds: $organizationIds) { id slug }
        }
      `,
      variables: { organizationIds: [userBLocalOrganizationId] },
      token: userAToken,
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
      variables: {
        organizationFilters: {
          slug: userBLocalSlug,
          partition: CatalogPartition.LOCAL,
        },
      },
      token: userAToken,
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
      variables: { organizationId: userBLocalOrganizationId },
      token: adminToken,
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
      variables: {
        createOrganizationInput: buildOrganizationInput(
          "admin-global-org",
          "Admin Global"
        ),
      },
      token: adminToken,
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
      variables: {
        organizationId,
        updateOrganizationInput: { slug: "admin-global-renamed" },
      },
      token: adminToken,
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
      variables: { organizationId },
      token: adminToken,
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
      variables: { organizationFilters: { slug: "scope-disabled-org" } },
      token: userAToken,
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
      variables: { organizationFilters: { slug: "scope-disabled-org" } },
      token: userAToken,
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
      variables: {
        createCourseInput: buildCourseInput(
          "attach-disabled-org-course",
          disabledOrganization.id
        ),
      },
      token: userAToken,
    });

    expect(response.errors?.[0]?.message).toContain(PERSISTENCE_NOT_FOUND);
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
      variables: {
        organizationFilters: {
          partition: CatalogPartition.LOCAL,
          ownerId: userAId,
          slug: "user-a-local-org",
        },
      },
      token: userBToken,
    });

    expect(response.errors).toBeUndefined();
    expect(response.data?.findManyOrganizations.found).toBe(0);
    expect(response.data?.findManyOrganizations.nodes).toEqual([]);
  });
});
