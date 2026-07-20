import { INestApplication } from "@nestjs/common";
import { testSuperAdminContext } from "@test/fixtures/auth-context";
import { App } from "supertest/types";
import { UserRole } from "@/core/enums/user-role.enum";
import { UsersService } from "@/modules/users/users.service";
import { clearTestDatabase } from "../support/clear-test-database";
import { createTestApp } from "../support/create-test-app";
import { graphqlRequest } from "../support/graphql-request";

const ALREADY_EXISTS_REGEX = /already exists/i;

const REGISTER = `
  mutation Register($registerInput: RegisterUserInput!) {
    register(registerInput: $registerInput) {
      id
      email
      nickname
      disabled
      role
    }
  }
`;

const SIGN_IN = `
  mutation SignIn($signInInput: SignInInput!) {
    signIn(signInInput: $signInInput)
  }
`;

const UPDATE_ONE_USER = `
  mutation UpdateOneUser($userId: ID!, $updateUserInput: UpdateUserInput!) {
    updateOneUser(userId: $userId, updateUserInput: $updateUserInput) {
      id
      disabled
    }
  }
`;

describe("User registration (e2e)", () => {
  let app: INestApplication<App>;
  let usersService: UsersService;
  let adminToken: string;

  beforeAll(async () => {
    const testApp = await createTestApp();
    ({ app } = testApp);
    await clearTestDatabase(testApp.module);
    usersService = testApp.module.get(UsersService);

    await usersService.createOne(testSuperAdminContext(), {
      email: "admin@profile.info",
      name: "Admin",
      nickname: "admin",
      password: "123123",
      role: UserRole.SUPER_ADMIN,
    });

    const signIn = await graphqlRequest<{ signIn: string }>(app, {
      query: SIGN_IN,
      variables: {
        signInInput: { email: "admin@profile.info", password: "123123" },
      },
    });

    adminToken = signIn.data?.signIn ?? "";
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it("registers a public user as disabled USER", async () => {
    const response = await graphqlRequest<{
      register: {
        id: string;
        email: string;
        disabled: boolean;
        role: UserRole;
      };
    }>(app, {
      query: REGISTER,
      variables: {
        registerInput: {
          email: "pending@profile.info",
          name: "Pending User",
          nickname: "pending-user",
          password: "pending.123",
        },
      },
    });

    expect(response.errors).toBeUndefined();
    expect(response.data?.register).toMatchObject({
      disabled: true,
      email: "pending@profile.info",
      role: UserRole.USER,
    });
  });

  it("rejects sign-in for a disabled registered user", async () => {
    const response = await graphqlRequest(app, {
      query: SIGN_IN,
      variables: {
        signInInput: {
          email: "pending@profile.info",
          password: "pending.123",
        },
      },
    });

    expect(response.data?.signIn).toBeUndefined();
    expect(response.errors?.[0]?.extensions?.code).toBe("UNAUTHENTICATED");
    expect(response.errors?.[0]?.message).toBe("Account pending approval");
  });

  it("allows sign-in after a super admin enables the user", async () => {
    const user = await usersService.findOne({
      filters: { email: "pending@profile.info" },
    });

    await graphqlRequest(app, {
      query: UPDATE_ONE_USER,
      token: adminToken,
      variables: {
        updateUserInput: { disabled: false },
        userId: user.id,
      },
    });

    const signIn = await graphqlRequest<{ signIn: string }>(app, {
      query: SIGN_IN,
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

  it("rejects sign-in after a super admin re-disables the user", async () => {
    const user = await usersService.findOne({
      filters: { email: "pending@profile.info" },
    });

    await graphqlRequest(app, {
      query: UPDATE_ONE_USER,
      token: adminToken,
      variables: {
        updateUserInput: { disabled: true },
        userId: user.id,
      },
    });

    const response = await graphqlRequest(app, {
      query: SIGN_IN,
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

  it("rejects register with a duplicate email", async () => {
    const response = await graphqlRequest(app, {
      query: REGISTER,
      variables: {
        registerInput: {
          email: "pending@profile.info",
          name: "Other",
          nickname: "other-pending",
          password: "pending.123",
        },
      },
    });

    expect(response.data?.register).toBeUndefined();
    expect(response.errors?.[0]?.message).toMatch(ALREADY_EXISTS_REGEX);
  });

  it("rejects register with a duplicate nickname", async () => {
    const response = await graphqlRequest(app, {
      query: REGISTER,
      variables: {
        registerInput: {
          email: "other-pending@profile.info",
          name: "Other",
          nickname: "pending-user",
          password: "pending.123",
        },
      },
    });

    expect(response.data?.register).toBeUndefined();
    expect(response.errors?.[0]?.message).toMatch(ALREADY_EXISTS_REGEX);
  });

  it("rejects sign-in with a wrong password", async () => {
    const response = await graphqlRequest(app, {
      query: SIGN_IN,
      variables: {
        signInInput: {
          email: "admin@profile.info",
          password: "wrong-password",
        },
      },
    });

    expect(response.data?.signIn).toBeUndefined();
    expect(response.errors?.[0]?.extensions?.code).toBe("UNAUTHENTICATED");
  });

  it("rejects sign-in with an unknown email", async () => {
    const response = await graphqlRequest(app, {
      query: SIGN_IN,
      variables: {
        signInInput: {
          email: "missing@profile.info",
          password: "123123",
        },
      },
    });

    expect(response.data?.signIn).toBeUndefined();
    expect(response.errors?.[0]?.extensions?.code).toBe("UNAUTHENTICATED");
  });
});
