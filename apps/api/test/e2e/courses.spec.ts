import { INestApplication } from "@nestjs/common";
import { testSuperAdminContext } from "@test/fixtures/auth-context";
import { App } from "supertest/types";
import { UserRole } from "@/core/enums/user-role.enum";
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

const CREATE_ONE_COURSE = `
  mutation CreateOneCourse($createCourseInput: CreateCourseInput!) {
    createOneCourse(createCourseInput: $createCourseInput) {
      id
      slug
    }
  }
`;

const FIND_ONE_COURSE_BY_ID = `
  query FindOneCourseById($courseId: ID!) {
    findOneCourseById(courseId: $courseId) {
      id
      slug
    }
  }
`;

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

const REMOVE_ONE_COURSE = `
  mutation RemoveOneCourse($courseId: ID!) {
    removeOneCourse(courseId: $courseId) {
      id
    }
  }
`;

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

describe("Courses tenant isolation (e2e)", () => {
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

    await usersService.createOne(testSuperAdminContext(), {
      name: "João",
      nickname: "joao",
      email: "joao@profile.info",
      password: "123123",
      role: UserRole.USER,
    });

    await usersService.createOne(testSuperAdminContext(), {
      name: "Maria",
      nickname: "maria",
      email: "maria@profile.info",
      password: "123123",
      role: UserRole.USER,
    });

    await usersService.createOne(testSuperAdminContext(), {
      name: "Admin",
      nickname: "admin",
      email: "admin@profile.info",
      password: "123123",
      role: UserRole.SUPER_ADMIN,
    });

    const organization = await organizationsService.createOne(
      testSuperAdminContext(),
      {
        slug: "course-org",
        name: "Course Org",
        website: "https://course.example",
        logo: "https://course.example/logo.png",
        category: OrganizationCategory.COMPANY,
        i18n: [{ locale: "en", messages: { description: "Org" } }],
      }
    );
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

    userAToken = await signIn("joao@profile.info", "123123");
    userBToken = await signIn("maria@profile.info", "123123");
    adminToken = await signIn("admin@profile.info", "123123");
  });

  afterAll(async () => {
    await app?.close();
  });

  it("should return UNAUTHENTICATED for course queries without a token", async () => {
    const response = await graphqlRequest(app, {
      query: FIND_ONE_COURSE_BY_ID,
      variables: { courseId: "507f1f77bcf86cd799439011" },
    });

    expect(response.errors?.[0]?.extensions?.code).toBe("UNAUTHENTICATED");
  });

  it("should let a USER create a course under their own tenant", async () => {
    const response = await graphqlRequest<{
      createOneCourse: { id: string; slug: string };
    }>(app, {
      query: CREATE_ONE_COURSE,
      variables: {
        createCourseInput: buildCourseInput("alice-bootcamp", organizationId),
      },
      token: userAToken,
    });

    expect(response.errors).toBeUndefined();
    expect(response.data?.createOneCourse.slug).toBe("alice-bootcamp");
  });

  it("should reject create with an invalid organizationId", async () => {
    const response = await graphqlRequest(app, {
      query: CREATE_ONE_COURSE,
      variables: {
        createCourseInput: buildCourseInput(
          "invalid-org-course",
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
      query: CREATE_ONE_COURSE,
      variables: {
        createCourseInput: {
          ...buildCourseInput("invalid-skills-course", organizationId),
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
      query: CREATE_ONE_COURSE,
      variables: {
        createCourseInput: buildCourseInput(
          "unknown-org-course",
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
      query: CREATE_ONE_COURSE,
      variables: {
        createCourseInput: {
          ...buildCourseInput("unknown-skills-course", organizationId),
          skillIds: [UNKNOWN_CATALOG_ID],
        },
      },
      token: userAToken,
    });

    expect(response.errors?.length).toBeGreaterThan(0);
    expect(response.errors?.[0]?.message).toContain(REFERENCES_NOT_FOUND);
    expect(response.data).toBeNull();
  });

  it("should list only the caller tenant courses for USER A", async () => {
    const response = await graphqlRequest<{
      findManyCourses: { found: number; nodes: Array<{ slug: string }> };
    }>(app, {
      query: FIND_MANY_COURSES,
      token: userAToken,
    });

    expect(response.errors).toBeUndefined();
    expect(response.data?.findManyCourses.found).toBe(1);
    expect(
      response.data?.findManyCourses.nodes.map((node) => node.slug)
    ).toEqual(["alice-bootcamp"]);
  });

  it("should not expose USER A course to USER B by id", async () => {
    const aliceCourses = await graphqlRequest<{
      findManyCourses: { nodes: Array<{ id: string }> };
    }>(app, {
      query: FIND_MANY_COURSES,
      token: userAToken,
    });

    const courseId = aliceCourses.data?.findManyCourses.nodes[0]?.id;
    expect(courseId).toBeDefined();

    const response = await graphqlRequest(app, {
      query: FIND_ONE_COURSE_BY_ID,
      variables: { courseId },
      token: userBToken,
    });

    expect(response.errors?.[0]?.message).toContain("Not Found");
    expect(response.data?.findOneCourseById).toBeUndefined();
  });

  it("should not let USER B delete USER A course", async () => {
    const aliceCourses = await graphqlRequest<{
      findManyCourses: { nodes: Array<{ id: string }> };
    }>(app, {
      query: FIND_MANY_COURSES,
      token: userAToken,
    });

    const courseId = aliceCourses.data?.findManyCourses.nodes[0]?.id;
    expect(courseId).toBeDefined();

    const response = await graphqlRequest(app, {
      query: REMOVE_ONE_COURSE,
      variables: { courseId },
      token: userBToken,
    });

    expect(response.errors?.[0]?.message).toContain("Not Removed");
  });

  it("should let SUPER_ADMIN read USER A course by explicit id", async () => {
    const aliceCourses = await graphqlRequest<{
      findManyCourses: { nodes: Array<{ id: string; slug: string }> };
    }>(app, {
      query: FIND_MANY_COURSES,
      token: userAToken,
    });

    const course = aliceCourses.data?.findManyCourses.nodes[0];
    expect(course).toBeDefined();

    const response = await graphqlRequest<{
      findOneCourseById: { id: string; slug: string };
    }>(app, {
      query: FIND_ONE_COURSE_BY_ID,
      variables: { courseId: course!.id },
      token: adminToken,
    });

    expect(response.errors).toBeUndefined();
    expect(response.data?.findOneCourseById.slug).toBe(course!.slug);
  });

  it("should allow the same slug for different tenants", async () => {
    const response = await graphqlRequest<{
      createOneCourse: { id: string; slug: string };
    }>(app, {
      query: CREATE_ONE_COURSE,
      variables: {
        createCourseInput: buildCourseInput("alice-bootcamp", organizationId),
      },
      token: userBToken,
    });

    expect(response.errors).toBeUndefined();
    expect(response.data?.createOneCourse.slug).toBe("alice-bootcamp");

    const bobCourses = await graphqlRequest<{
      findManyCourses: { found: number; nodes: Array<{ slug: string }> };
    }>(app, {
      query: FIND_MANY_COURSES,
      token: userBToken,
    });

    expect(bobCourses.data?.findManyCourses.found).toBe(1);
    expect(bobCourses.data?.findManyCourses.nodes[0]?.slug).toBe(
      "alice-bootcamp"
    );
  });
});
