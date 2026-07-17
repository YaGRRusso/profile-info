import { INestApplication } from "@nestjs/common";
import {
  testAuthContext,
  testSuperAdminContext,
} from "@test/fixtures/auth-context";
import { App } from "supertest/types";
import { CatalogPartition } from "@/core/enums/catalog-partition.enum";
import { UserRole } from "@/core/enums/user-role.enum";
import { PERSISTENCE_NOT_FOUND } from "@/core/persistence/persistence.messages";
import { SkillsService } from "@/modules/skills/skills.service";
import { UsersService } from "@/modules/users/users.service";
import { clearTestDatabase } from "../support/clear-test-database";
import { createTestApp } from "../support/create-test-app";
import { graphqlRequest } from "../support/graphql-request";
import { skillI18n } from "../support/skill-i18n";

const MUTATION_BLOCKED_MESSAGE = /Not (found|updated|removed)/;

function firstGraphqlErrorMessage(
  errors: Array<{ message: string }> | undefined
): string {
  return errors?.[0]?.message ?? "";
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

describe("Skills catalog scope (e2e)", () => {
  let app: INestApplication<App>;
  let skillsService: SkillsService;
  let adminToken: string;
  let userAToken: string;
  let userAId: string;
  let userBId: string;
  let globalSkillId: string;
  let userBLocalSkillId: string;
  let userBLocalSlug: string;

  beforeAll(async () => {
    const testApp = await createTestApp();
    ({ app } = testApp);
    await clearTestDatabase(testApp.module);

    const usersService = testApp.module.get(UsersService);
    skillsService = testApp.module.get(SkillsService);

    await usersService.createOne(testSuperAdminContext(), {
      email: "admin@profile.info",
      name: "Admin",
      nickname: "admin",
      password: "123123",
      role: UserRole.SUPER_ADMIN,
    });

    const userA = await usersService.createOne(testSuperAdminContext(), {
      email: "user-a@profile.info",
      name: "User A",
      nickname: "user-a",
      password: "user-a.123",
      role: UserRole.USER,
    });
    userAId = userA.id;

    const userB = await usersService.createOne(testSuperAdminContext(), {
      email: "user-b@profile.info",
      name: "User B",
      nickname: "user-b",
      password: "user-b.123",
      role: UserRole.USER,
    });
    userBId = userB.id;

    adminToken = await signIn(app, "admin@profile.info", "123123");
    userAToken = await signIn(app, "user-a@profile.info", "user-a.123");

    const globalSkill = await skillsService.createOne(testSuperAdminContext(), {
      category: "Programming",
      i18n: skillI18n("Scope Global"),
      slug: "scope-global-skill",
    });
    globalSkillId = globalSkill.id;

    userBLocalSlug = "user-b-local-skill";
    const userBLocalSkill = await skillsService.createOne(
      testAuthContext({ id: userBId }),
      {
        category: "Programming",
        i18n: skillI18n("User B Local"),
        slug: userBLocalSlug,
      }
    );
    userBLocalSkillId = userBLocalSkill.id;
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it("1 — USER creates a LOCAL catalog skill with partition LOCAL", async () => {
    const response = await graphqlRequest<{
      createOneSkill: { slug: string; partition: CatalogPartition };
    }>(app, {
      query: `
        mutation CreateOneSkill($createSkillInput: CreateSkillInput!) {
          createOneSkill(createSkillInput: $createSkillInput) {
            slug
            partition
          }
        }
      `,
      token: userAToken,
      variables: {
        createSkillInput: {
          category: "Programming",
          i18n: skillI18n("User A Local"),
          slug: "user-a-local-skill",
        },
      },
    });

    expect(response.errors).toBeUndefined();
    expect(response.data?.createOneSkill.slug).toBe("user-a-local-skill");
    expect(response.data?.createOneSkill.partition).toBe(
      CatalogPartition.LOCAL
    );
  });

  it("2 — USER cannot disable, update, or remove a GLOBAL catalog skill", async () => {
    const disableResponse = await graphqlRequest(app, {
      query: `
        mutation DisableOneSkill($skillId: ID!) {
          disableOneSkill(skillId: $skillId) { id }
        }
      `,
      token: userAToken,
      variables: { skillId: globalSkillId },
    });
    expect(firstGraphqlErrorMessage(disableResponse.errors)).toMatch(
      MUTATION_BLOCKED_MESSAGE
    );

    const updateResponse = await graphqlRequest(app, {
      query: `
        mutation UpdateOneSkill($skillId: ID!, $updateSkillInput: UpdateSkillInput!) {
          updateOneSkill(skillId: $skillId, updateSkillInput: $updateSkillInput) {
            id
          }
        }
      `,
      token: userAToken,
      variables: {
        skillId: globalSkillId,
        updateSkillInput: { slug: "hijacked-global" },
      },
    });
    expect(firstGraphqlErrorMessage(updateResponse.errors)).toMatch(
      MUTATION_BLOCKED_MESSAGE
    );

    const removeResponse = await graphqlRequest(app, {
      query: `
        mutation RemoveOneSkill($skillId: ID!) {
          removeOneSkill(skillId: $skillId) { id }
        }
      `,
      token: userAToken,
      variables: { skillId: globalSkillId },
    });
    expect(firstGraphqlErrorMessage(removeResponse.errors)).toMatch(
      MUTATION_BLOCKED_MESSAGE
    );
  });

  it("3 — USER A cannot read USER B LOCAL via findOneById, findManyById, or findManySkills", async () => {
    const findOneById = await graphqlRequest(app, {
      query: `
        query FindOneSkillById($skillId: ID!) {
          findOneSkillById(skillId: $skillId) { id slug }
        }
      `,
      token: userAToken,
      variables: { skillId: userBLocalSkillId },
    });
    expect(findOneById.errors?.[0]?.message).toContain("Not found");

    const findManyById = await graphqlRequest<{
      findManySkillById: Array<{ id: string; slug: string }>;
    }>(app, {
      query: `
        query FindManySkillById($skillIds: [ID!]!) {
          findManySkillById(skillIds: $skillIds) { id slug }
        }
      `,
      token: userAToken,
      variables: { skillIds: [userBLocalSkillId] },
    });
    expect(findManyById.errors).toBeUndefined();
    expect(findManyById.data?.findManySkillById).toEqual([]);

    const findManySkills = await graphqlRequest<{
      findManySkills: { found: number; nodes: Array<{ slug: string }> };
    }>(app, {
      query: `
        query FindManySkills($skillFilters: FilterSkillInput) {
          findManySkills(skillFilters: $skillFilters) {
            found
            nodes { slug }
          }
        }
      `,
      token: userAToken,
      variables: {
        skillFilters: {
          partition: CatalogPartition.LOCAL,
          slug: userBLocalSlug,
        },
      },
    });
    expect(findManySkills.errors).toBeUndefined();
    expect(findManySkills.data?.findManySkills.found).toBe(0);
    expect(findManySkills.data?.findManySkills.nodes).toEqual([]);
  });

  it("4 — SUPER_ADMIN reads GLOBAL and all users LOCAL skills", async () => {
    const response = await graphqlRequest<{
      findManySkills: {
        nodes: Array<{ slug: string; partition: CatalogPartition }>;
      };
    }>(app, {
      query: `
        query FindManySkills {
          findManySkills {
            nodes { slug partition }
          }
        }
      `,
      token: adminToken,
    });

    expect(response.errors).toBeUndefined();
    const slugs = response.data?.findManySkills.nodes.map((node) => node.slug);
    expect(slugs).toContain("scope-global-skill");
    expect(slugs).toContain("user-a-local-skill");
    expect(slugs).toContain(userBLocalSlug);
  });

  it("5 — SUPER_ADMIN cannot mutate another users LOCAL skill", async () => {
    const response = await graphqlRequest(app, {
      query: `
        mutation DisableOneSkill($skillId: ID!) {
          disableOneSkill(skillId: $skillId) { id }
        }
      `,
      token: adminToken,
      variables: { skillId: userBLocalSkillId },
    });

    expect(firstGraphqlErrorMessage(response.errors)).toMatch(
      MUTATION_BLOCKED_MESSAGE
    );
  });

  it("6 — SUPER_ADMIN creates, updates, and disables a GLOBAL catalog skill", async () => {
    const createResponse = await graphqlRequest<{
      createOneSkill: { id: string; slug: string; partition: CatalogPartition };
    }>(app, {
      query: `
        mutation CreateOneSkill($createSkillInput: CreateSkillInput!) {
          createOneSkill(createSkillInput: $createSkillInput) {
            id
            slug
            partition
          }
        }
      `,
      token: adminToken,
      variables: {
        createSkillInput: {
          category: "Programming",
          i18n: skillI18n("Admin Global"),
          slug: "admin-global-skill",
        },
      },
    });

    expect(createResponse.errors).toBeUndefined();
    expect(createResponse.data?.createOneSkill.partition).toBe(
      CatalogPartition.GLOBAL
    );

    const skillId = createResponse.data?.createOneSkill.id ?? "";

    const updateResponse = await graphqlRequest<{
      updateOneSkill: { slug: string };
    }>(app, {
      query: `
        mutation UpdateOneSkill($skillId: ID!, $updateSkillInput: UpdateSkillInput!) {
          updateOneSkill(skillId: $skillId, updateSkillInput: $updateSkillInput) {
            slug
          }
        }
      `,
      token: adminToken,
      variables: {
        skillId,
        updateSkillInput: { slug: "admin-global-renamed" },
      },
    });
    expect(updateResponse.errors).toBeUndefined();
    expect(updateResponse.data?.updateOneSkill.slug).toBe(
      "admin-global-renamed"
    );

    const disableResponse = await graphqlRequest<{
      disableOneSkill: { id: string };
    }>(app, {
      query: `
        mutation DisableOneSkill($skillId: ID!) {
          disableOneSkill(skillId: $skillId) { id }
        }
      `,
      token: adminToken,
      variables: { skillId },
    });
    expect(disableResponse.errors).toBeUndefined();
    expect(disableResponse.data?.disableOneSkill.id).toBe(skillId);
  });

  it("7 — findManyActiveSkills excludes disabled skills in caller scope", async () => {
    const disabledSkill = await skillsService.createOne(
      testSuperAdminContext(),
      {
        category: "Programming",
        i18n: skillI18n("Scope Disabled"),
        slug: "scope-disabled-skill",
      }
    );

    await skillsService.disableOne(testSuperAdminContext(), disabledSkill.id);

    const browseResponse = await graphqlRequest<{
      findManySkills: { nodes: Array<{ slug: string }> };
    }>(app, {
      query: `
        query FindManySkills($skillFilters: FilterSkillInput) {
          findManySkills(skillFilters: $skillFilters) {
            nodes { slug }
          }
        }
      `,
      token: userAToken,
      variables: { skillFilters: { slug: "scope-disabled-skill" } },
    });
    expect(browseResponse.errors).toBeUndefined();
    expect(browseResponse.data?.findManySkills.nodes).toHaveLength(1);

    const activeResponse = await graphqlRequest<{
      findManyActiveSkills: { found: number; nodes: Array<{ slug: string }> };
    }>(app, {
      query: `
        query FindManyActiveSkills($skillFilters: FilterSkillInput) {
          findManyActiveSkills(skillFilters: $skillFilters) {
            found
            nodes { slug }
          }
        }
      `,
      token: userAToken,
      variables: { skillFilters: { slug: "scope-disabled-skill" } },
    });
    expect(activeResponse.errors).toBeUndefined();
    expect(activeResponse.data?.findManyActiveSkills.found).toBe(0);
    expect(activeResponse.data?.findManyActiveSkills.nodes).toEqual([]);
  });

  it("8 — assertSkillsEnabled blocks attaching a disabled skill via updateMe", async () => {
    const disabledSkill = await skillsService.createOne(
      testSuperAdminContext(),
      {
        category: "Programming",
        i18n: skillI18n("Attach Disabled"),
        slug: "attach-disabled-skill",
      }
    );

    await skillsService.disableOne(testSuperAdminContext(), disabledSkill.id);

    const response = await graphqlRequest(app, {
      query: `
        mutation UpdateMe($updateMeInput: UpdateMeInput!) {
          updateMe(updateMeInput: $updateMeInput) { id }
        }
      `,
      token: userAToken,
      variables: { updateMeInput: { skillIds: [disabledSkill.id] } },
    });

    expect(response.errors?.[0]?.message).toContain(PERSISTENCE_NOT_FOUND.en);
  });

  it("9 — FilterSkillInput with another users ownerId and LOCAL does not leak", async () => {
    const userBToken = await signIn(app, "user-b@profile.info", "user-b.123");

    const response = await graphqlRequest<{
      findManySkills: { found: number; nodes: Array<{ slug: string }> };
    }>(app, {
      query: `
        query FindManySkills($skillFilters: FilterSkillInput) {
          findManySkills(skillFilters: $skillFilters) {
            found
            nodes { slug }
          }
        }
      `,
      token: userBToken,
      variables: {
        skillFilters: {
          ownerId: userAId,
          partition: CatalogPartition.LOCAL,
          slug: "user-a-local-skill",
        },
      },
    });

    expect(response.errors).toBeUndefined();
    expect(response.data?.findManySkills.found).toBe(0);
    expect(response.data?.findManySkills.nodes).toEqual([]);
  });
});
