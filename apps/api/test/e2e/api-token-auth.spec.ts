import { INestApplication } from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import { testSuperAdminContext } from "@test/fixtures/auth-context";
import { hash } from "bcryptjs";
import { Model } from "mongoose";
import { App } from "supertest/types";
import { ApiTokenPermission } from "@/core/enums/api-token-permission.enum";
import { UserRole } from "@/core/enums/user-role.enum";
import { API_TOKEN_PREFIX } from "@/modules/api-tokens/constants/api-token.constants";
import { ApiTokenModel } from "@/modules/api-tokens/schemas/api-token.schema";
import { OrganizationCategory } from "@/modules/organizations/enums/category.enum";
import { OrganizationsService } from "@/modules/organizations/organizations.service";
import { UsersService } from "@/modules/users/users.service";
import { clearTestDatabase } from "../support/clear-test-database";
import { createTestApp } from "../support/create-test-app";
import { graphqlRequest } from "../support/graphql-request";

const FIND_MANY_COURSES = `
  query FindManyCourses {
    findManyCourses {
      found
      nodes {
        id
        slug
      }
    }
  }
`;

const CREATE_ONE_COURSE = `
  mutation CreateOneCourse($createCourseInput: CreateCourseInput!) {
    createOneCourse(createCourseInput: $createCourseInput) {
      id
      slug
    }
  }
`;

const FIND_MANY_API_TOKENS = `
  query FindManyApiTokens {
    findManyApiTokens {
      found
    }
  }
`;

const GET_ME = `
  query GetMe {
    getMe {
      id
      email
    }
  }
`;

const QUERY_TOKEN_ID = "674a00000000000000000001";
const MUTATE_TOKEN_ID = "674a00000000000000000002";
const QUERY_TOKEN_SECRET = "joao-query-dev-secret-32-chars!!";
const MUTATE_TOKEN_SECRET = "joao-mutate-dev-secret-32-chars!!";

describe("API token authentication (e2e)", () => {
  let app: INestApplication<App>;
  let organizationId: string;
  let queryApiToken: string;
  let mutateApiToken: string;

  beforeAll(async () => {
    const testApp = await createTestApp();
    app = testApp.app;
    await clearTestDatabase(testApp.module);

    const usersService = testApp.module.get(UsersService);
    const organizationsService = testApp.module.get(OrganizationsService);
    const apiTokenModel = testApp.module.get<Model<ApiTokenModel>>(
      getModelToken(ApiTokenModel.name)
    );

    const joao = await usersService.createOne(testSuperAdminContext(), {
      name: "João",
      nickname: "joao",
      email: "joao@profile.info",
      password: "123123",
      role: UserRole.USER,
    });

    const organization = await organizationsService.createOne(
      testSuperAdminContext(),
      {
        slug: "api-token-org",
        name: "API Token Org",
        website: "https://api-token.example",
        logo: "https://api-token.example/logo.png",
        category: OrganizationCategory.COMPANY,
        i18n: [{ locale: "en", messages: { description: "Org" } }],
      }
    );
    organizationId = organization.id;

    await apiTokenModel.create([
      {
        _id: QUERY_TOKEN_ID,
        ownerId: joao.id,
        name: "Alice query",
        hashedSecret: await hash(QUERY_TOKEN_SECRET, 8),
        permissions: [ApiTokenPermission.QUERY],
      },
      {
        _id: MUTATE_TOKEN_ID,
        ownerId: joao.id,
        name: "Alice mutate",
        hashedSecret: await hash(MUTATE_TOKEN_SECRET, 8),
        permissions: [ApiTokenPermission.MUTATE],
      },
    ]);

    queryApiToken = `${API_TOKEN_PREFIX}${QUERY_TOKEN_ID}_${QUERY_TOKEN_SECRET}`;
    mutateApiToken = `${API_TOKEN_PREFIX}${MUTATE_TOKEN_ID}_${MUTATE_TOKEN_SECRET}`;

    const sessionToken = await graphqlRequest<{ signIn: string }>(app, {
      query: `
        mutation SignIn($signInInput: SignInInput!) {
          signIn(signInInput: $signInInput)
        }
      `,
      variables: {
        signInInput: { email: "joao@profile.info", password: "123123" },
      },
    });

    await graphqlRequest(app, {
      query: CREATE_ONE_COURSE,
      variables: {
        createCourseInput: {
          slug: "alice-api-token-course",
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
        },
      },
      token: sessionToken.data?.signIn,
    });
  });

  afterAll(async () => {
    await app?.close();
  });

  it("should let QUERY tokens read own courses", async () => {
    const response = await graphqlRequest<{
      findManyCourses: { found: number; nodes: Array<{ slug: string }> };
    }>(app, {
      query: FIND_MANY_COURSES,
      apiKey: queryApiToken,
    });

    expect(response.errors).toBeUndefined();
    expect(response.data?.findManyCourses.found).toBe(1);
    expect(response.data?.findManyCourses.nodes[0]?.slug).toBe(
      "alice-api-token-course"
    );
  });

  it("should let QUERY tokens call getMe", async () => {
    const response = await graphqlRequest<{
      getMe: { email: string };
    }>(app, {
      query: GET_ME,
      apiKey: queryApiToken,
    });

    expect(response.errors).toBeUndefined();
    expect(response.data?.getMe.email).toBe("joao@profile.info");
  });

  it("should forbid QUERY tokens from mutations", async () => {
    const response = await graphqlRequest(app, {
      query: CREATE_ONE_COURSE,
      variables: {
        createCourseInput: {
          slug: "blocked-by-query-token",
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
        },
      },
      apiKey: queryApiToken,
    });

    expect(response.errors?.[0]?.message).toBe(
      "Insufficient API token permissions"
    );
  });

  it("should let MUTATE tokens create own courses", async () => {
    const response = await graphqlRequest<{
      createOneCourse: { slug: string };
    }>(app, {
      query: CREATE_ONE_COURSE,
      variables: {
        createCourseInput: {
          slug: "created-by-mutate-token",
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
        },
      },
      apiKey: mutateApiToken,
    });

    expect(response.errors).toBeUndefined();
    expect(response.data?.createOneCourse.slug).toBe("created-by-mutate-token");
  });

  it("should forbid MUTATE tokens from queries", async () => {
    const response = await graphqlRequest(app, {
      query: FIND_MANY_COURSES,
      apiKey: mutateApiToken,
    });

    expect(response.errors?.[0]?.message).toBe(
      "Insufficient API token permissions"
    );
  });

  it("should forbid API tokens from session-only routes", async () => {
    const response = await graphqlRequest(app, {
      query: FIND_MANY_API_TOKENS,
      apiKey: queryApiToken,
    });

    expect(response.errors?.[0]?.message).toBe("Session required");
  });
});
