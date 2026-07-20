import { INestApplication } from "@nestjs/common";
import { testSuperAdminContext } from "@test/fixtures/auth-context";
import { App } from "supertest/types";
import { UserRole } from "@/core/enums/user-role.enum";
import { UsersService } from "@/modules/users/users.service";
import { assertDefined } from "../support/assert-defined";
import {
  INVALID_OBJECT_ID,
  REFERENCES_NOT_FOUND,
  UNKNOWN_CATALOG_ID,
} from "../support/catalog-reference-validation";
import { clearTestDatabase } from "../support/clear-test-database";
import { createTestApp } from "../support/create-test-app";
import {
  NOT_FOUND_MESSAGE,
  NOT_REMOVED_MESSAGE,
} from "../support/error-message-matchers";
import { graphqlRequest } from "../support/graphql-request";

const CREATE_ONE_PROJECT = `
  mutation CreateOneProject($createProjectInput: CreateProjectInput!) {
    createOneProject(createProjectInput: $createProjectInput) {
      id
      slug
    }
  }
`;

const FIND_ONE_PROJECT_BY_ID = `
  query FindOneProjectById($projectId: ID!) {
    findOneProjectById(projectId: $projectId) {
      id
      slug
    }
  }
`;

const FIND_MANY_PROJECTS = `
  query FindManyProjects {
    findManyProjects {
      found
      nodes {
        id
        slug
      }
    }
  }
`;

const REMOVE_ONE_PROJECT = `
  mutation RemoveOneProject($projectId: ID!) {
    removeOneProject(projectId: $projectId) {
      id
    }
  }
`;

function buildProjectInput(slug: string) {
  return {
    i18n: [
      {
        locale: "en",
        messages: {
          description: "A full-stack portfolio project",
          title: "Portfolio App",
        },
      },
    ],
    relevance: 1,
    slug,
  };
}

describe("Projects tenant isolation (e2e)", () => {
  let app: INestApplication<App>;
  let usersService: UsersService;
  let userAToken: string;
  let userBToken: string;
  let adminToken: string;

  beforeAll(async () => {
    const testApp = await createTestApp();
    ({ app } = testApp);
    await clearTestDatabase(testApp.module);

    usersService = testApp.module.get(UsersService);

    await usersService.createOne(testSuperAdminContext(), {
      email: "joao@profile.info",
      name: "João",
      nickname: "joao",
      password: "123123",
      role: UserRole.USER,
    });

    await usersService.createOne(testSuperAdminContext(), {
      email: "maria@profile.info",
      name: "Maria",
      nickname: "maria",
      password: "123123",
      role: UserRole.USER,
    });

    await usersService.createOne(testSuperAdminContext(), {
      email: "admin@profile.info",
      name: "Admin",
      nickname: "admin",
      password: "123123",
      role: UserRole.SUPER_ADMIN,
    });

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

  it("should return UNAUTHENTICATED for project queries without a token", async () => {
    const response = await graphqlRequest(app, {
      query: FIND_ONE_PROJECT_BY_ID,
      variables: { projectId: "507f1f77bcf86cd799439011" },
    });

    expect(response.errors?.[0]?.extensions?.code).toBe("UNAUTHENTICATED");
  });

  it("should let a USER create a project under their own tenant", async () => {
    const response = await graphqlRequest<{
      createOneProject: { id: string; slug: string };
    }>(app, {
      query: CREATE_ONE_PROJECT,
      token: userAToken,
      variables: {
        createProjectInput: buildProjectInput("alice-portfolio"),
      },
    });

    expect(response.errors).toBeUndefined();
    expect(response.data?.createOneProject.slug).toBe("alice-portfolio");
  });

  it("should reject create with invalid skillIds", async () => {
    const response = await graphqlRequest(app, {
      query: CREATE_ONE_PROJECT,
      token: userAToken,
      variables: {
        createProjectInput: {
          ...buildProjectInput("invalid-skills-project"),
          skillIds: [INVALID_OBJECT_ID],
        },
      },
    });

    expect(response.errors?.length).toBeGreaterThan(0);
    expect(response.data).toBeNull();
  });

  it("should reject create with unknown skillIds", async () => {
    const response = await graphqlRequest(app, {
      query: CREATE_ONE_PROJECT,
      token: userAToken,
      variables: {
        createProjectInput: {
          ...buildProjectInput("unknown-skills-project"),
          skillIds: [UNKNOWN_CATALOG_ID],
        },
      },
    });

    expect(response.errors?.length).toBeGreaterThan(0);
    expect(response.errors?.[0]?.message).toContain(REFERENCES_NOT_FOUND);
    expect(response.data).toBeNull();
  });

  it("should list only the caller tenant projects for USER A", async () => {
    const response = await graphqlRequest<{
      findManyProjects: { found: number; nodes: Array<{ slug: string }> };
    }>(app, {
      query: FIND_MANY_PROJECTS,
      token: userAToken,
    });

    expect(response.errors).toBeUndefined();
    expect(response.data?.findManyProjects.found).toBe(1);
    expect(
      response.data?.findManyProjects.nodes.map((node) => node.slug)
    ).toEqual(["alice-portfolio"]);
  });

  it("should not expose USER A project to USER B by id", async () => {
    const aliceProjects = await graphqlRequest<{
      findManyProjects: { nodes: Array<{ id: string }> };
    }>(app, {
      query: FIND_MANY_PROJECTS,
      token: userAToken,
    });

    const projectId = aliceProjects.data?.findManyProjects.nodes[0]?.id;
    expect(projectId).toBeDefined();

    const response = await graphqlRequest(app, {
      query: FIND_ONE_PROJECT_BY_ID,
      token: userBToken,
      variables: { projectId },
    });

    expect(response.errors?.[0]?.message).toMatch(NOT_FOUND_MESSAGE);
    expect(response.data?.findOneProjectById).toBeUndefined();
  });

  it("should not let USER B delete USER A project", async () => {
    const aliceProjects = await graphqlRequest<{
      findManyProjects: { nodes: Array<{ id: string }> };
    }>(app, {
      query: FIND_MANY_PROJECTS,
      token: userAToken,
    });

    const projectId = aliceProjects.data?.findManyProjects.nodes[0]?.id;
    expect(projectId).toBeDefined();

    const response = await graphqlRequest(app, {
      query: REMOVE_ONE_PROJECT,
      token: userBToken,
      variables: { projectId },
    });

    expect(response.errors?.[0]?.message).toMatch(NOT_REMOVED_MESSAGE);
  });

  it("should let SUPER_ADMIN read USER A project by explicit id", async () => {
    const aliceProjects = await graphqlRequest<{
      findManyProjects: { nodes: Array<{ id: string; slug: string }> };
    }>(app, {
      query: FIND_MANY_PROJECTS,
      token: userAToken,
    });

    const project = aliceProjects.data?.findManyProjects.nodes[0];
    expect(project).toBeDefined();
    assertDefined(project);

    const response = await graphqlRequest<{
      findOneProjectById: { id: string; slug: string };
    }>(app, {
      query: FIND_ONE_PROJECT_BY_ID,
      token: adminToken,
      variables: { projectId: project.id },
    });

    expect(response.errors).toBeUndefined();
    expect(response.data?.findOneProjectById.slug).toBe(project.slug);
  });

  it("should allow the same slug for different tenants", async () => {
    const response = await graphqlRequest<{
      createOneProject: { id: string; slug: string };
    }>(app, {
      query: CREATE_ONE_PROJECT,
      token: userBToken,
      variables: {
        createProjectInput: buildProjectInput("alice-portfolio"),
      },
    });

    expect(response.errors).toBeUndefined();
    expect(response.data?.createOneProject.slug).toBe("alice-portfolio");

    const bobProjects = await graphqlRequest<{
      findManyProjects: { found: number; nodes: Array<{ slug: string }> };
    }>(app, {
      query: FIND_MANY_PROJECTS,
      token: userBToken,
    });

    expect(bobProjects.data?.findManyProjects.found).toBe(1);
    expect(bobProjects.data?.findManyProjects.nodes[0]?.slug).toBe(
      "alice-portfolio"
    );
  });
});
