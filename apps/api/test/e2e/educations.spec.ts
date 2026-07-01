import { INestApplication } from "@nestjs/common";
import { App } from "supertest/types";
import { UserRole } from "@/core/enums/user-role.enum";
import { EducationLevel } from "@/modules/educations/enums/level.enum";
import { EducationStatus } from "@/modules/educations/enums/status.enum";
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

const CREATE_ONE_EDUCATION = `
  mutation CreateOneEducation($createEducationInput: CreateEducationInput!) {
    createOneEducation(createEducationInput: $createEducationInput) {
      id
      slug
    }
  }
`;

const FIND_ONE_EDUCATION_BY_ID = `
  query FindOneEducationById($educationId: ID!) {
    findOneEducationById(educationId: $educationId) {
      id
      slug
    }
  }
`;

const FIND_MANY_EDUCATIONS = `
  query FindManyEducations {
    findManyEducations {
      found
      nodes {
        id
        slug
      }
    }
  }
`;

const REMOVE_ONE_EDUCATION = `
  mutation RemoveOneEducation($educationId: ID!) {
    removeOneEducation(educationId: $educationId) {
      id
    }
  }
`;

function buildEducationInput(slug: string, organizationId: string) {
  return {
    slug,
    organizationId,
    level: EducationLevel.BACHELOR,
    status: EducationStatus.COMPLETE,
    relevance: 1,
    i18n: [
      {
        locale: "en",
        messages: {
          title: "Bachelor of Science",
          description: "Computer Science",
        },
      },
    ],
  };
}

describe("Educations tenant isolation (e2e)", () => {
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
      slug: "education-org",
      name: "Education Org",
      website: "https://education.example",
      logo: "https://education.example/logo.png",
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

  it("should return UNAUTHENTICATED for education queries without a token", async () => {
    const response = await graphqlRequest(app, {
      query: FIND_ONE_EDUCATION_BY_ID,
      variables: { educationId: "507f1f77bcf86cd799439011" },
    });

    expect(response.errors?.[0]?.extensions?.code).toBe("UNAUTHENTICATED");
  });

  it("should let a USER create an education under their own tenant", async () => {
    const response = await graphqlRequest<{
      createOneEducation: { id: string; slug: string };
    }>(app, {
      query: CREATE_ONE_EDUCATION,
      variables: {
        createEducationInput: buildEducationInput(
          "alice-bachelor",
          organizationId
        ),
      },
      token: userAToken,
    });

    expect(response.errors).toBeUndefined();
    expect(response.data?.createOneEducation.slug).toBe("alice-bachelor");
  });

  it("should reject create with an invalid organizationId", async () => {
    const response = await graphqlRequest(app, {
      query: CREATE_ONE_EDUCATION,
      variables: {
        createEducationInput: buildEducationInput(
          "invalid-org-education",
          INVALID_OBJECT_ID
        ),
      },
      token: userAToken,
    });

    expect(response.errors?.length).toBeGreaterThan(0);
    expect(response.data).toBeNull();
  });

  it("should reject create with invalid skillIds", async () => {
    const response = await graphqlRequest(app, {
      query: CREATE_ONE_EDUCATION,
      variables: {
        createEducationInput: {
          ...buildEducationInput("invalid-skills-education", organizationId),
          skillIds: [INVALID_OBJECT_ID],
        },
      },
      token: userAToken,
    });

    expect(response.errors?.length).toBeGreaterThan(0);
    expect(response.data).toBeNull();
  });

  it("should reject create with unknown organizationId", async () => {
    const response = await graphqlRequest(app, {
      query: CREATE_ONE_EDUCATION,
      variables: {
        createEducationInput: buildEducationInput(
          "unknown-org-education",
          UNKNOWN_CATALOG_ID
        ),
      },
      token: userAToken,
    });

    expect(response.errors?.length).toBeGreaterThan(0);
    expect(response.errors?.[0]?.message).toContain(REFERENCES_NOT_FOUND);
    expect(response.data).toBeNull();
  });

  it("should reject create with unknown skillIds", async () => {
    const response = await graphqlRequest(app, {
      query: CREATE_ONE_EDUCATION,
      variables: {
        createEducationInput: {
          ...buildEducationInput("unknown-skills-education", organizationId),
          skillIds: [UNKNOWN_CATALOG_ID],
        },
      },
      token: userAToken,
    });

    expect(response.errors?.length).toBeGreaterThan(0);
    expect(response.errors?.[0]?.message).toContain(REFERENCES_NOT_FOUND);
    expect(response.data).toBeNull();
  });

  it("should list only the caller tenant educations for USER A", async () => {
    const response = await graphqlRequest<{
      findManyEducations: { found: number; nodes: Array<{ slug: string }> };
    }>(app, {
      query: FIND_MANY_EDUCATIONS,
      token: userAToken,
    });

    expect(response.errors).toBeUndefined();
    expect(response.data?.findManyEducations.found).toBe(1);
    expect(
      response.data?.findManyEducations.nodes.map((node) => node.slug)
    ).toEqual(["alice-bachelor"]);
  });

  it("should not expose USER A education to USER B by id", async () => {
    const aliceEducations = await graphqlRequest<{
      findManyEducations: { nodes: Array<{ id: string }> };
    }>(app, {
      query: FIND_MANY_EDUCATIONS,
      token: userAToken,
    });

    const educationId = aliceEducations.data?.findManyEducations.nodes[0]?.id;
    expect(educationId).toBeDefined();

    const response = await graphqlRequest(app, {
      query: FIND_ONE_EDUCATION_BY_ID,
      variables: { educationId },
      token: userBToken,
    });

    expect(response.errors?.[0]?.message).toContain("Not Found");
    expect(response.data?.findOneEducationById).toBeUndefined();
  });

  it("should not let USER B delete USER A education", async () => {
    const aliceEducations = await graphqlRequest<{
      findManyEducations: { nodes: Array<{ id: string }> };
    }>(app, {
      query: FIND_MANY_EDUCATIONS,
      token: userAToken,
    });

    const educationId = aliceEducations.data?.findManyEducations.nodes[0]?.id;
    expect(educationId).toBeDefined();

    const response = await graphqlRequest(app, {
      query: REMOVE_ONE_EDUCATION,
      variables: { educationId },
      token: userBToken,
    });

    expect(response.errors?.[0]?.message).toContain("Not Removed");
  });

  it("should let SUPER_ADMIN read USER A education by explicit id", async () => {
    const aliceEducations = await graphqlRequest<{
      findManyEducations: { nodes: Array<{ id: string; slug: string }> };
    }>(app, {
      query: FIND_MANY_EDUCATIONS,
      token: userAToken,
    });

    const education = aliceEducations.data?.findManyEducations.nodes[0];
    expect(education).toBeDefined();

    const response = await graphqlRequest<{
      findOneEducationById: { id: string; slug: string };
    }>(app, {
      query: FIND_ONE_EDUCATION_BY_ID,
      variables: { educationId: education!.id },
      token: adminToken,
    });

    expect(response.errors).toBeUndefined();
    expect(response.data?.findOneEducationById.slug).toBe(education!.slug);
  });

  it("should allow the same slug for different tenants", async () => {
    const response = await graphqlRequest<{
      createOneEducation: { id: string; slug: string };
    }>(app, {
      query: CREATE_ONE_EDUCATION,
      variables: {
        createEducationInput: buildEducationInput(
          "alice-bachelor",
          organizationId
        ),
      },
      token: userBToken,
    });

    expect(response.errors).toBeUndefined();
    expect(response.data?.createOneEducation.slug).toBe("alice-bachelor");

    const bobEducations = await graphqlRequest<{
      findManyEducations: { found: number; nodes: Array<{ slug: string }> };
    }>(app, {
      query: FIND_MANY_EDUCATIONS,
      token: userBToken,
    });

    expect(bobEducations.data?.findManyEducations.found).toBe(1);
    expect(bobEducations.data?.findManyEducations.nodes[0]?.slug).toBe(
      "alice-bachelor"
    );
  });
});
