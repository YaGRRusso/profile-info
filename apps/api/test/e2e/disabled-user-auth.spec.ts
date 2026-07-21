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
import { UsersService } from "@/modules/users/users.service";
import { clearTestDatabase } from "../support/clear-test-database";
import { createTestApp } from "../support/create-test-app";
import { graphqlRequest } from "../support/graphql-request";

const SIGN_IN = `
  mutation SignIn($signInInput: SignInInput!) {
    signIn(signInInput: $signInInput)
  }
`;

const TOGGLE_STATUS_ONE_USER = `
  mutation ToggleStatusOneUser($userId: ID!, $disabled: Boolean!) {
    toggleStatusOneUser(userId: $userId, disabled: $disabled) {
      id
      disabled
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

const QUERY_TOKEN_ID = "674a00000000000000000011";
const QUERY_TOKEN_SECRET = "disabled-owner-dev-secret-32chars!";

describe("Disabled user authentication (e2e)", () => {
  let app: INestApplication<App>;
  let usersService: UsersService;
  let adminToken: string;
  let userId: string;
  let userSessionToken: string;
  let userApiKey: string;

  beforeAll(async () => {
    const testApp = await createTestApp();
    ({ app } = testApp);
    await clearTestDatabase(testApp.module);
    usersService = testApp.module.get(UsersService);

    const apiTokenModel = testApp.module.get<Model<ApiTokenModel>>(
      getModelToken(ApiTokenModel.name)
    );

    await usersService.createOne(testSuperAdminContext(), {
      email: "admin@profile.info",
      name: "Admin",
      nickname: "admin",
      password: "123123",
      role: UserRole.SUPER_ADMIN,
    });

    const user = await usersService.createOne(testSuperAdminContext(), {
      email: "joao@profile.info",
      name: "João",
      nickname: "joao",
      password: "123123",
      role: UserRole.USER,
    });
    userId = user.id;

    await apiTokenModel.create({
      _id: QUERY_TOKEN_ID,
      hashedSecret: await hash(QUERY_TOKEN_SECRET, 8),
      name: "João query",
      ownerId: user.id,
      permissions: [ApiTokenPermission.QUERY],
    });
    userApiKey = `${API_TOKEN_PREFIX}${QUERY_TOKEN_ID}_${QUERY_TOKEN_SECRET}`;

    const adminSignIn = await graphqlRequest<{ signIn: string }>(app, {
      query: SIGN_IN,
      variables: {
        signInInput: { email: "admin@profile.info", password: "123123" },
      },
    });
    adminToken = adminSignIn.data?.signIn ?? "";

    const userSignIn = await graphqlRequest<{ signIn: string }>(app, {
      query: SIGN_IN,
      variables: {
        signInInput: { email: "joao@profile.info", password: "123123" },
      },
    });
    userSessionToken = userSignIn.data?.signIn ?? "";
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it("rejects an existing JWT after the user is disabled", async () => {
    const before = await graphqlRequest<{
      getMe: { email: string };
    }>(app, {
      query: GET_ME,
      token: userSessionToken,
    });

    expect(before.errors).toBeUndefined();
    expect(before.data?.getMe.email).toBe("joao@profile.info");

    await graphqlRequest(app, {
      query: TOGGLE_STATUS_ONE_USER,
      token: adminToken,
      variables: {
        disabled: true,
        userId,
      },
    });

    const after = await graphqlRequest(app, {
      query: GET_ME,
      token: userSessionToken,
    });

    expect(after.data?.getMe).toBeUndefined();
    expect(after.errors?.[0]?.extensions?.code).toBe("UNAUTHENTICATED");
  });

  it("rejects an API key when the owner is disabled", async () => {
    const response = await graphqlRequest(app, {
      apiKey: userApiKey,
      query: GET_ME,
    });

    expect(response.data?.getMe).toBeUndefined();
    expect(response.errors?.[0]?.extensions?.code).toBe("UNAUTHENTICATED");
  });
});
