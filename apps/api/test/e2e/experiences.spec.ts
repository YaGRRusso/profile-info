import { INestApplication } from "@nestjs/common";
import { App } from "supertest/types";
import { UserRole } from "@/core/enums/user-role.enum";
import { ExperienceCategory } from "@/modules/experiences/enums/category.enum";
import { OrganizationCategory } from "@/modules/organizations/enums/category.enum";
import { OrganizationsService } from "@/modules/organizations/organizations.service";
import { UsersService } from "@/modules/users/users.service";
import {
  INVALID_OBJECT_ID,
  REFERENCES_NOT_FOUND,
  UNKNOWN_CATALOG_ID,
} from "../support/catalog-reference-validation";
import { clearTestDatabase } from "../support/clear-test-database";
import { createTestApp } from "../support/create-test-app";
import { graphqlRequest } from "../support/graphql-request";

const CREATE_ONE_EXPERIENCE = `
  mutation CreateOneExperience($createExperienceInput: CreateExperienceInput!) {
    createOneExperience(createExperienceInput: $createExperienceInput) {
      id
      slug
    }
  }
`;

const FIND_ONE_EXPERIENCE_BY_ID = `
  query FindOneExperienceById($experienceId: ID!) {
    findOneExperienceById(experienceId: $experienceId) {
      id
      slug
    }
  }
`;

const FIND_MANY_EXPERIENCES = `
  query FindManyExperiences {
    findManyExperiences {
      found
      nodes {
        id
        slug
      }
    }
  }
`;

const REMOVE_ONE_EXPERIENCE = `
  mutation RemoveOneExperience($experienceId: ID!) {
    removeOneExperience(experienceId: $experienceId) {
      id
    }
  }
`;

function buildExperienceInput(slug: string, organizationId: string) {
  return {
    slug,
    organizationId,
    category: ExperienceCategory.FULL_TIME,
    relevance: 1,
    roles: [
      {
        i18n: [
          {
            locale: "en",
            messages: {
              title: "Engineer",
              description: "Built APIs",
            },
          },
        ],
      },
    ],
  };
}

describe("Experiences tenant isolation (e2e)", () => {
  let app: INestApplication<App>;
  let usersService: UsersService;
  let organizationsService: OrganizationsService;
  let organizationId: string;
  let userAToken: string;
  let userBToken: string;
  let adminToken: string;

  beforeAll(async () => {
    const testApp = await createTestApp();
    app = testApp.app;
    await clearTestDatabase(testApp.module);

    usersService = testApp.module.get(UsersService);
    organizationsService = testApp.module.get(OrganizationsService);

    await usersService.createOne({
      name: "Alice",
      nickname: "alice",
      email: "alice@profile.info",
      password: "alice.pass",
      role: UserRole.USER,
    });

    await usersService.createOne({
      name: "Bob",
      nickname: "bob",
      email: "bob@profile.info",
      password: "bob.pass",
      role: UserRole.USER,
    });

    await usersService.createOne({
      name: "Admin",
      nickname: "admin",
      email: "admin@profile.info",
      password: "pass.123",
      role: UserRole.SUPER_ADMIN,
    });

    const organization = await organizationsService.createOne({
      slug: "experience-org",
      name: "Experience Org",
      website: "https://experience.example",
      logo: "https://experience.example/logo.png",
      category: OrganizationCategory.COMPANY,
      i18n: [{ locale: "en", messages: { description: "Org" } }],
    });
    organizationId = organization.id;

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

    userAToken = await signIn("alice@profile.info", "alice.pass");
    userBToken = await signIn("bob@profile.info", "bob.pass");
    adminToken = await signIn("admin@profile.info", "pass.123");
  });

  afterAll(async () => {
    await app?.close();
  });

  it("should return UNAUTHENTICATED for experience queries without a token", async () => {
    const response = await graphqlRequest(app, {
      query: FIND_ONE_EXPERIENCE_BY_ID,
      variables: { experienceId: "507f1f77bcf86cd799439011" },
    });

    expect(response.errors?.[0]?.extensions?.code).toBe("UNAUTHENTICATED");
  });

  it("should let a USER create an experience under their own tenant", async () => {
    const response = await graphqlRequest<{
      createOneExperience: { id: string; slug: string };
    }>(app, {
      query: CREATE_ONE_EXPERIENCE,
      variables: {
        createExperienceInput: buildExperienceInput(
          "alice-engineer",
          organizationId
        ),
      },
      token: userAToken,
    });

    expect(response.errors).toBeUndefined();
    expect(response.data?.createOneExperience.slug).toBe("alice-engineer");
  });

  it("should reject create with an invalid organizationId", async () => {
    const response = await graphqlRequest(app, {
      query: CREATE_ONE_EXPERIENCE,
      variables: {
        createExperienceInput: buildExperienceInput(
          "invalid-org-experience",
          INVALID_OBJECT_ID
        ),
      },
      token: userAToken,
    });

    expect(response.errors?.length).toBeGreaterThan(0);
    expect(response.data).toBeNull();
  });

  it("should reject create with invalid skillIds in roles", async () => {
    const response = await graphqlRequest(app, {
      query: CREATE_ONE_EXPERIENCE,
      variables: {
        createExperienceInput: {
          ...buildExperienceInput("invalid-skills-experience", organizationId),
          roles: [
            {
              i18n: [
                {
                  locale: "en",
                  messages: {
                    title: "Engineer",
                    description: "Built APIs",
                  },
                },
              ],
              skillIds: [INVALID_OBJECT_ID],
            },
          ],
        },
      },
      token: userAToken,
    });

    expect(response.errors?.length).toBeGreaterThan(0);
    expect(response.data).toBeNull();
  });

  it("should reject create with unknown organizationId", async () => {
    const response = await graphqlRequest(app, {
      query: CREATE_ONE_EXPERIENCE,
      variables: {
        createExperienceInput: buildExperienceInput(
          "unknown-org-experience",
          UNKNOWN_CATALOG_ID
        ),
      },
      token: userAToken,
    });

    expect(response.errors?.length).toBeGreaterThan(0);
    expect(response.errors?.[0]?.message).toContain(REFERENCES_NOT_FOUND);
    expect(response.data).toBeNull();
  });

  it("should reject create with unknown skillIds in roles", async () => {
    const response = await graphqlRequest(app, {
      query: CREATE_ONE_EXPERIENCE,
      variables: {
        createExperienceInput: {
          ...buildExperienceInput("unknown-skills-experience", organizationId),
          roles: [
            {
              i18n: [
                {
                  locale: "en",
                  messages: {
                    title: "Engineer",
                    description: "Built APIs",
                  },
                },
              ],
              skillIds: [UNKNOWN_CATALOG_ID],
            },
          ],
        },
      },
      token: userAToken,
    });

    expect(response.errors?.length).toBeGreaterThan(0);
    expect(response.errors?.[0]?.message).toContain(REFERENCES_NOT_FOUND);
    expect(response.data).toBeNull();
  });

  it("should list only the caller tenant experiences for USER A", async () => {
    const response = await graphqlRequest<{
      findManyExperiences: { found: number; nodes: Array<{ slug: string }> };
    }>(app, {
      query: FIND_MANY_EXPERIENCES,
      token: userAToken,
    });

    expect(response.errors).toBeUndefined();
    expect(response.data?.findManyExperiences.found).toBe(1);
    expect(
      response.data?.findManyExperiences.nodes.map((node) => node.slug)
    ).toEqual(["alice-engineer"]);
  });

  it("should not expose USER A experience to USER B by id", async () => {
    const aliceExperiences = await graphqlRequest<{
      findManyExperiences: { nodes: Array<{ id: string }> };
    }>(app, {
      query: FIND_MANY_EXPERIENCES,
      token: userAToken,
    });

    const experienceId =
      aliceExperiences.data?.findManyExperiences.nodes[0]?.id;
    expect(experienceId).toBeDefined();

    const response = await graphqlRequest(app, {
      query: FIND_ONE_EXPERIENCE_BY_ID,
      variables: { experienceId },
      token: userBToken,
    });

    expect(response.errors?.[0]?.message).toContain("Not Found");
    expect(response.data?.findOneExperienceById).toBeUndefined();
  });

  it("should not let USER B delete USER A experience", async () => {
    const aliceExperiences = await graphqlRequest<{
      findManyExperiences: { nodes: Array<{ id: string }> };
    }>(app, {
      query: FIND_MANY_EXPERIENCES,
      token: userAToken,
    });

    const experienceId =
      aliceExperiences.data?.findManyExperiences.nodes[0]?.id;
    expect(experienceId).toBeDefined();

    const response = await graphqlRequest(app, {
      query: REMOVE_ONE_EXPERIENCE,
      variables: { experienceId },
      token: userBToken,
    });

    expect(response.errors?.[0]?.message).toContain("Not Removed");
  });

  it("should let SUPER_ADMIN read USER A experience by explicit id", async () => {
    const aliceExperiences = await graphqlRequest<{
      findManyExperiences: { nodes: Array<{ id: string; slug: string }> };
    }>(app, {
      query: FIND_MANY_EXPERIENCES,
      token: userAToken,
    });

    const experience = aliceExperiences.data?.findManyExperiences.nodes[0];
    expect(experience).toBeDefined();

    const response = await graphqlRequest<{
      findOneExperienceById: { id: string; slug: string };
    }>(app, {
      query: FIND_ONE_EXPERIENCE_BY_ID,
      variables: { experienceId: experience!.id },
      token: adminToken,
    });

    expect(response.errors).toBeUndefined();
    expect(response.data?.findOneExperienceById.slug).toBe(experience!.slug);
  });

  it("should allow the same slug for different tenants", async () => {
    const response = await graphqlRequest<{
      createOneExperience: { id: string; slug: string };
    }>(app, {
      query: CREATE_ONE_EXPERIENCE,
      variables: {
        createExperienceInput: buildExperienceInput(
          "alice-engineer",
          organizationId
        ),
      },
      token: userBToken,
    });

    expect(response.errors).toBeUndefined();
    expect(response.data?.createOneExperience.slug).toBe("alice-engineer");

    const bobExperiences = await graphqlRequest<{
      findManyExperiences: { found: number; nodes: Array<{ slug: string }> };
    }>(app, {
      query: FIND_MANY_EXPERIENCES,
      token: userBToken,
    });

    expect(bobExperiences.data?.findManyExperiences.found).toBe(1);
    expect(bobExperiences.data?.findManyExperiences.nodes[0]?.slug).toBe(
      "alice-engineer"
    );
  });
});
