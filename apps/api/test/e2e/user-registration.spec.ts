import { INestApplication } from "@nestjs/common";
import { testSuperAdminContext } from "@test/fixtures/auth-context";
import { App } from "supertest/types";
import { UserRole } from "@/core/enums/user-role.enum";
import { UsersService } from "@/modules/users/users.service";
import { clearTestDatabase } from "../support/clear-test-database";
import { createTestApp } from "../support/create-test-app";
import { graphqlRequest } from "../support/graphql-request";

describe("User registration (e2e)", () => {
  let app: INestApplication<App>;
  let usersService: UsersService;
  let adminToken: string;

  beforeAll(async () => {
    const testApp = await createTestApp();
    app = testApp.app;
    await clearTestDatabase(testApp.module);
    usersService = testApp.module.get(UsersService);

    await usersService.createOne(testSuperAdminContext(), {
      name: "Admin",
      nickname: "admin",
      email: "admin@profile.info",
      password: "123123",
      role: UserRole.SUPER_ADMIN,
    });

    const signIn = await graphqlRequest<{ signIn: string }>(app, {
      query: `
        mutation SignIn($signInInput: SignInInput!) {
          signIn(signInInput: $signInInput)
        }
      `,
      variables: {
        signInInput: { email: "admin@profile.info", password: "123123" },
      },
    });

    adminToken = signIn.data?.signIn ?? "";
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it("registers a public user as disabled", async () => {
    const response = await graphqlRequest<{
      register: {
        id: string;
        email: string;
        disabled: boolean;
        role: UserRole;
      };
    }>(app, {
      query: `
        mutation Register($registerInput: RegisterUserInput!) {
          register(registerInput: $registerInput) {
            id
            email
            disabled
            role
          }
        }
      `,
      variables: {
        registerInput: {
          name: "Pending User",
          nickname: "pending-user",
          email: "pending@profile.info",
          password: "pending.123",
        },
      },
    });

    expect(response.errors).toBeUndefined();
    expect(response.data?.register).toMatchObject({
      email: "pending@profile.info",
      disabled: true,
      role: UserRole.USER,
    });
  });

  it("rejects sign-in for a disabled registered user", async () => {
    const response = await graphqlRequest(app, {
      query: `
        mutation SignIn($signInInput: SignInInput!) {
          signIn(signInInput: $signInInput)
        }
      `,
      variables: {
        signInInput: {
          email: "pending@profile.info",
          password: "pending.123",
        },
      },
    });

    expect(response.data?.signIn).toBeUndefined();
    expect(response.errors?.[0]?.extensions?.code).toBe("UNAUTHENTICATED");
  });

  it("allows sign-in after a super admin enables the user", async () => {
    const user = await usersService.findOne({
      filters: { email: "pending@profile.info" },
    });

    await graphqlRequest(app, {
      query: `
        mutation UpdateOneUser(
          $userId: ID!
          $updateUserInput: UpdateUserInput!
        ) {
          updateOneUser(userId: $userId, updateUserInput: $updateUserInput) {
            id
            disabled
          }
        }
      `,
      variables: {
        userId: user.id,
        updateUserInput: { disabled: false },
      },
      token: adminToken,
    });

    const signIn = await graphqlRequest<{ signIn: string }>(app, {
      query: `
        mutation SignIn($signInInput: SignInInput!) {
          signIn(signInInput: $signInInput)
        }
      `,
      variables: {
        signInInput: {
          email: "pending@profile.info",
          password: "pending.123",
        },
      },
    });

    expect(signIn.errors).toBeUndefined();
    expect(signIn.data?.signIn).toEqual(expect.any(String));
  });
});
