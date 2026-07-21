import { INestApplication } from "@nestjs/common";
import {
  testAuthContext,
  testSuperAdminContext,
} from "@test/fixtures/auth-context";
import { App } from "supertest/types";
import { UserRole } from "@/core/enums/user-role.enum";
import { CoursesService } from "@/modules/courses/courses.service";
import { CreateCourseInput } from "@/modules/courses/dto/create-course.input";
import { CourseStatus } from "@/modules/courses/enums/status.enum";
import { CreateEducationInput } from "@/modules/educations/dto/create-education.input";
import { EducationsService } from "@/modules/educations/educations.service";
import { EducationLevel } from "@/modules/educations/enums/level.enum";
import { EducationStatus } from "@/modules/educations/enums/status.enum";
import { CreateExperienceInput } from "@/modules/experiences/dto/create-experience.input";
import { ExperienceCategory } from "@/modules/experiences/enums/category.enum";
import { ExperiencesService } from "@/modules/experiences/experiences.service";
import { OrganizationCategory } from "@/modules/organizations/enums/category.enum";
import { OrganizationsService } from "@/modules/organizations/organizations.service";
import { ProjectsService } from "@/modules/projects/projects.service";
import { UsersService } from "@/modules/users/users.service";
import { clearTestDatabase } from "../support/clear-test-database";
import { createTestApp } from "../support/create-test-app";
import { INSUFFICIENT_PERMISSIONS_MESSAGE } from "../support/error-message-matchers";
import { graphqlRequest } from "../support/graphql-request";

const SUPER_ADMIN_CANNOT_DELETE_REGEX = /SUPER_ADMIN users cannot be deleted/i;

const SIGN_IN = `
  mutation SignIn($signInInput: SignInInput!) {
    signIn(signInInput: $signInInput)
  }
`;

const CREATE_ONE_USER = `
  mutation CreateOneUser($createUserInput: CreateUserInput!) {
    createOneUser(createUserInput: $createUserInput) {
      id
      email
      disabled
      role
    }
  }
`;

const CREATE_MANY_USERS = `
  mutation CreateManyUsers($createUserInputs: [CreateUserInput!]!) {
    createManyUsers(createUserInputs: $createUserInputs) {
      succeeded
      failed
    }
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

const REMOVE_ONE_USER = `
  mutation RemoveOneUser($userId: ID!) {
    removeOneUser(userId: $userId) {
      id
      email
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
        ownedCounts {
          experiences
          educations
          courses
          projects
        }
      }
    }
  }
`;

const FIND_ONE_USER_BY_ID = `
  query FindOneUserById($userId: ID!) {
    findOneUserById(userId: $userId) {
      id
      email
    }
  }
`;

const FIND_ONE_USER_BY_ID_WITH_OWNED_COUNTS = `
  query FindOneUserByIdWithOwnedCounts($userId: ID!) {
    findOneUserById(userId: $userId) {
      id
      ownedCounts {
        experiences
      }
    }
  }
`;

describe("Users admin (e2e)", () => {
  let app: INestApplication<App>;
  let usersService: UsersService;
  let adminToken: string;
  let userToken: string;
  let userId: string;
  let adminId: string;

  beforeAll(async () => {
    const testApp = await createTestApp();
    ({ app } = testApp);
    await clearTestDatabase(testApp.module);
    usersService = testApp.module.get(UsersService);

    const admin = await usersService.createOne(testSuperAdminContext(), {
      email: "admin@profile.info",
      name: "Admin",
      nickname: "admin",
      password: "123123",
      role: UserRole.SUPER_ADMIN,
    });
    adminId = admin.id;

    const user = await usersService.createOne(testSuperAdminContext(), {
      email: "user@profile.info",
      name: "Regular User",
      nickname: "regular-user",
      password: "123123",
      role: UserRole.USER,
    });
    userId = user.id;

    const userCtx = testAuthContext({ id: user.id });
    const organizationsService = testApp.module.get(OrganizationsService);
    const experiencesService = testApp.module.get(ExperiencesService);
    const educationsService = testApp.module.get(EducationsService);
    const coursesService = testApp.module.get(CoursesService);
    const projectsService = testApp.module.get(ProjectsService);

    const organization = await organizationsService.createOne(
      testSuperAdminContext(),
      {
        category: OrganizationCategory.COMPANY,
        i18n: [{ locale: "en", messages: { description: "Org" } }],
        logo: "https://users-admin.example/logo.png",
        name: "Users Admin Org",
        slug: "users-admin-org",
      }
    );
    const organizationId = organization.id;

    await experiencesService.createOne(userCtx, {
      category: ExperienceCategory.FULL_TIME,
      i18n: [
        {
          locale: "en",
          messages: { description: "Work", title: "Engineer" },
        },
      ],
      organizationId,
      slug: "user-experience",
    } as CreateExperienceInput);
    await experiencesService.createOne(userCtx, {
      category: ExperienceCategory.FREELANCE,
      i18n: [
        {
          locale: "en",
          messages: { description: "Side", title: "Consultant" },
        },
      ],
      organizationId,
      slug: "user-experience-freelance",
    } as CreateExperienceInput);
    await educationsService.createOne(userCtx, {
      i18n: [
        {
          locale: "en",
          messages: { description: "CS", title: "Degree" },
        },
      ],
      level: EducationLevel.BACHELOR,
      organizationId,
      slug: "user-education",
      status: EducationStatus.COMPLETE,
    } as CreateEducationInput);
    await coursesService.createOne(userCtx, {
      i18n: [
        {
          locale: "en",
          messages: { description: "Done", title: "Course" },
        },
      ],
      organizationId,
      slug: "user-course",
      status: CourseStatus.COMPLETE,
    } as CreateCourseInput);
    await projectsService.createOne(userCtx, {
      i18n: [
        {
          locale: "en",
          messages: { description: "App", title: "Project" },
        },
      ],
      slug: "user-project",
    });

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
        signInInput: { email: "user@profile.info", password: "123123" },
      },
    });
    userToken = userSignIn.data?.signIn ?? "";
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it("forbids USER from createOneUser", async () => {
    const response = await graphqlRequest(app, {
      query: CREATE_ONE_USER,
      token: userToken,
      variables: {
        createUserInput: {
          email: "blocked@profile.info",
          name: "Blocked",
          nickname: "blocked",
          password: "123123123",
        },
      },
    });

    expect(response.data?.createOneUser).toBeUndefined();
    expect(response.errors?.[0]?.extensions?.code).toBe("FORBIDDEN");
  });

  it("forbids USER from updateOneUser", async () => {
    const response = await graphqlRequest(app, {
      query: UPDATE_ONE_USER,
      token: userToken,
      variables: {
        updateUserInput: { name: "Nope" },
        userId,
      },
    });

    expect(response.data?.updateOneUser).toBeUndefined();
    expect(response.errors?.[0]?.extensions?.code).toBe("FORBIDDEN");
  });

  it("forbids USER from removeOneUser", async () => {
    const response = await graphqlRequest(app, {
      query: REMOVE_ONE_USER,
      token: userToken,
      variables: { userId },
    });

    expect(response.data?.removeOneUser).toBeUndefined();
    expect(response.errors?.[0]?.extensions?.code).toBe("FORBIDDEN");
  });

  it("forbids USER from findManyUsers", async () => {
    const response = await graphqlRequest(app, {
      query: FIND_MANY_USERS,
      token: userToken,
    });

    expect(response.data?.findManyUsers).toBeUndefined();
    expect(response.errors?.[0]?.extensions?.code).toBe("FORBIDDEN");
  });

  it("lets authenticated USER call findOneUserById", async () => {
    const response = await graphqlRequest<{
      findOneUserById: { id: string; email: string };
    }>(app, {
      query: FIND_ONE_USER_BY_ID,
      token: userToken,
      variables: { userId: adminId },
    });

    expect(response.errors).toBeUndefined();
    expect(response.data?.findOneUserById).toMatchObject({
      email: "admin@profile.info",
      id: adminId,
    });
  });

  it("lets SUPER_ADMIN read ownedCounts on findManyUsers", async () => {
    const response = await graphqlRequest<{
      findManyUsers: {
        nodes: Array<{
          id: string;
          email: string;
          ownedCounts: {
            experiences: number;
            educations: number;
            courses: number;
            projects: number;
          };
        }>;
      };
    }>(app, {
      query: FIND_MANY_USERS,
      token: adminToken,
    });

    expect(response.errors).toBeUndefined();
    const row = response.data?.findManyUsers.nodes.find(
      (node) => node.id === userId
    );
    expect(row?.ownedCounts).toEqual({
      courses: 1,
      educations: 1,
      experiences: 2,
      projects: 1,
    });
  });

  it("forbids USER from ownedCounts on findOneUserById", async () => {
    const response = await graphqlRequest<{
      findOneUserById: { id: string; ownedCounts: unknown } | null;
    }>(app, {
      query: FIND_ONE_USER_BY_ID_WITH_OWNED_COUNTS,
      token: userToken,
      variables: { userId },
    });

    expect(response.errors?.[0]?.path).toEqual([
      "findOneUserById",
      "ownedCounts",
    ]);
    expect(response.errors?.[0]?.message).toMatch(
      INSUFFICIENT_PERMISSIONS_MESSAGE
    );
    expect(response.errors?.[0]?.extensions?.code).toBe("FORBIDDEN");
    // Non-null ownedCounts failure drops the parent from data.
    expect(response.data?.findOneUserById).toBeUndefined();
  });

  it("lets SUPER_ADMIN createOneUser as enabled USER", async () => {
    const response = await graphqlRequest<{
      createOneUser: {
        id: string;
        email: string;
        disabled: boolean;
        role: UserRole;
      };
    }>(app, {
      query: CREATE_ONE_USER,
      token: adminToken,
      variables: {
        createUserInput: {
          email: "created@profile.info",
          name: "Created",
          nickname: "created-user",
          password: "123123123",
        },
      },
    });

    expect(response.errors).toBeUndefined();
    expect(response.data?.createOneUser).toMatchObject({
      disabled: false,
      email: "created@profile.info",
      role: UserRole.USER,
    });
  });

  it("lets SUPER_ADMIN createManyUsers", async () => {
    const response = await graphqlRequest<{
      createManyUsers: { succeeded: number; failed: number };
    }>(app, {
      query: CREATE_MANY_USERS,
      token: adminToken,
      variables: {
        createUserInputs: [
          {
            email: "batch-a@profile.info",
            name: "Batch A",
            nickname: "batch-a",
            password: "123123123",
          },
          {
            email: "batch-b@profile.info",
            name: "Batch B",
            nickname: "batch-b",
            password: "123123123",
          },
        ],
      },
    });

    expect(response.errors).toBeUndefined();
    expect(response.data?.createManyUsers).toEqual({
      failed: 0,
      succeeded: 2,
    });
  });

  it("lets SUPER_ADMIN removeOneUser for a USER", async () => {
    const removable = await usersService.createOne(testSuperAdminContext(), {
      email: "removable@profile.info",
      name: "Removable",
      nickname: "removable",
      password: "123123123",
      role: UserRole.USER,
    });

    const response = await graphqlRequest<{
      removeOneUser: { id: string; email: string };
    }>(app, {
      query: REMOVE_ONE_USER,
      token: adminToken,
      variables: { userId: removable.id },
    });

    expect(response.errors).toBeUndefined();
    expect(response.data?.removeOneUser).toMatchObject({
      email: "removable@profile.info",
      id: removable.id,
    });
  });

  it("rejects removeOneUser for a SUPER_ADMIN", async () => {
    const otherAdmin = await usersService.createOne(testSuperAdminContext(), {
      email: "other-admin@profile.info",
      name: "Other Admin",
      nickname: "other-admin",
      password: "123123123",
      role: UserRole.SUPER_ADMIN,
    });

    const response = await graphqlRequest(app, {
      query: REMOVE_ONE_USER,
      token: adminToken,
      variables: { userId: otherAdmin.id },
    });

    expect(response.data?.removeOneUser).toBeUndefined();
    expect(response.errors?.[0]?.message).toMatch(
      SUPER_ADMIN_CANNOT_DELETE_REGEX
    );
  });
});
