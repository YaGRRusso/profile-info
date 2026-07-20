import { INestApplication } from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import {
  testAuthContext,
  testSuperAdminContext,
} from "@test/fixtures/auth-context";
import { hash } from "bcryptjs";
import { Model } from "mongoose";
import { App } from "supertest/types";
import { ApiTokenPermission } from "@/core/enums/api-token-permission.enum";
import { CatalogPartition } from "@/core/enums/catalog-partition.enum";
import { UserRole } from "@/core/enums/user-role.enum";
import { API_TOKEN_PREFIX } from "@/modules/api-tokens/constants/api-token.constants";
import { ApiTokenModel } from "@/modules/api-tokens/schemas/api-token.schema";
import { SkillsService } from "@/modules/skills/skills.service";
import { UsersService } from "@/modules/users/users.service";
import { clearTestDatabase } from "../support/clear-test-database";
import { createTestApp } from "../support/create-test-app";
import { MUTATION_BLOCKED_MESSAGE } from "../support/error-message-matchers";
import { graphqlRequest } from "../support/graphql-request";
import { skillI18n } from "../support/skill-i18n";

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

describe("Catalog batch and edge cases (e2e)", () => {
  let app: INestApplication<App>;
  let skillsService: SkillsService;
  let userAToken: string;
  let userAId: string;
  let userBId: string;
  let globalSkillId: string;
  let userALocalSkillId: string;
  let userBLocalSkillId: string;
  let queryApiToken: string;

  beforeAll(async () => {
    const testApp = await createTestApp();
    ({ app } = testApp);
    await clearTestDatabase(testApp.module);

    const usersService = testApp.module.get(UsersService);
    skillsService = testApp.module.get(SkillsService);
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

    userAToken = await signIn(app, "user-a@profile.info", "user-a.123");

    const globalSkill = await skillsService.createOne(testSuperAdminContext(), {
      category: "Programming",
      i18n: skillI18n("Batch Global"),
      slug: "batch-global-skill",
    });
    globalSkillId = globalSkill.id;

    const userALocalSkill = await skillsService.createOne(
      testAuthContext({ id: userAId }),
      {
        category: "Programming",
        i18n: skillI18n("User A Local Batch"),
        slug: "batch-user-a-local",
      }
    );
    userALocalSkillId = userALocalSkill.id;

    const userBLocalSkill = await skillsService.createOne(
      testAuthContext({ id: userBId }),
      {
        category: "Programming",
        i18n: skillI18n("User B Local Batch"),
        slug: "batch-user-b-local",
      }
    );
    userBLocalSkillId = userBLocalSkill.id;

    const queryTokenId = "674a00000000000000000011";
    const queryTokenSecret = "batch-query-token-secret-32chars!!";

    await apiTokenModel.create({
      _id: queryTokenId,
      hashedSecret: await hash(queryTokenSecret, 8),
      name: "User A query",
      ownerId: userAId,
      permissions: [ApiTokenPermission.QUERY],
    });

    queryApiToken = `${API_TOKEN_PREFIX}${queryTokenId}_${queryTokenSecret}`;
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  describe("batch mutations", () => {
    it("disableMany reports partial success when mixing in-scope and out-of-scope IDs", async () => {
      const response = await graphqlRequest<{
        disableManySkills: { succeeded: number; failed: number };
      }>(app, {
        query: `
          mutation DisableManySkills($skillIds: [ID!]!) {
            disableManySkills(skillIds: $skillIds) {
              succeeded
              failed
            }
          }
        `,
        token: userAToken,
        variables: {
          skillIds: [userALocalSkillId, globalSkillId],
        },
      });

      expect(response.errors).toBeUndefined();
      expect(response.data?.disableManySkills).toEqual({
        failed: 1,
        succeeded: 1,
      });

      await skillsService.enableOne(
        testAuthContext({ id: userAId }),
        userALocalSkillId
      );
    });

    it("disableMany fails when every ID is out of mutate scope", async () => {
      const response = await graphqlRequest(app, {
        query: `
          mutation DisableManySkills($skillIds: [ID!]!) {
            disableManySkills(skillIds: $skillIds) {
              succeeded
              failed
            }
          }
        `,
        token: userAToken,
        variables: { skillIds: [globalSkillId] },
      });

      expect(response.errors?.[0]?.message).toMatch(MUTATION_BLOCKED_MESSAGE);
    });

    it("updateMany reports partial success when mixing in-scope and out-of-scope IDs", async () => {
      const response = await graphqlRequest<{
        updateManySkills: { succeeded: number; failed: number };
      }>(app, {
        query: `
          mutation UpdateManySkills(
            $skillIds: [ID!]!
            $updateSkillInput: UpdateSkillInput!
          ) {
            updateManySkills(
              skillIds: $skillIds
              updateSkillInput: $updateSkillInput
            ) {
              succeeded
              failed
            }
          }
        `,
        token: userAToken,
        variables: {
          skillIds: [userALocalSkillId, globalSkillId],
          updateSkillInput: { category: "Batch Updated" },
        },
      });

      expect(response.errors).toBeUndefined();
      expect(response.data?.updateManySkills).toEqual({
        failed: 1,
        succeeded: 1,
      });

      const localSkill = await skillsService.findOneById(
        testAuthContext({ id: userAId }),
        userALocalSkillId
      );
      expect(localSkill.category).toBe("Batch Updated");
    });

    it("removeMany fails when every ID is out of mutate scope", async () => {
      const response = await graphqlRequest(app, {
        query: `
          mutation RemoveManySkills($skillIds: [ID!]!) {
            removeManySkills(skillIds: $skillIds) {
              succeeded
              failed
            }
          }
        `,
        token: userAToken,
        variables: { skillIds: [globalSkillId, userBLocalSkillId] },
      });

      expect(response.errors?.[0]?.message).toMatch(MUTATION_BLOCKED_MESSAGE);
    });
  });

  describe("slug uniqueness per partition", () => {
    it("allows the same slug on GLOBAL and LOCAL for the same user", async () => {
      const sharedSlug = "shared-partition-slug";

      const globalResponse = await graphqlRequest<{
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
        token: await signIn(app, "admin@profile.info", "123123"),
        variables: {
          createSkillInput: {
            category: "Programming",
            i18n: skillI18n("Shared Slug Global"),
            slug: sharedSlug,
          },
        },
      });

      expect(globalResponse.errors).toBeUndefined();
      expect(globalResponse.data?.createOneSkill.partition).toBe(
        CatalogPartition.GLOBAL
      );

      const localResponse = await graphqlRequest<{
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
            i18n: skillI18n("Shared Slug Local"),
            slug: sharedSlug,
          },
        },
      });

      expect(localResponse.errors).toBeUndefined();
      expect(localResponse.data?.createOneSkill.slug).toBe(sharedSlug);
      expect(localResponse.data?.createOneSkill.partition).toBe(
        CatalogPartition.LOCAL
      );
    });

    it("rejects duplicate LOCAL slug for the same user", async () => {
      const response = await graphqlRequest(app, {
        query: `
          mutation CreateOneSkill($createSkillInput: CreateSkillInput!) {
            createOneSkill(createSkillInput: $createSkillInput) {
              id
            }
          }
        `,
        token: userAToken,
        variables: {
          createSkillInput: {
            category: "Programming",
            i18n: skillI18n("Duplicate Local"),
            slug: "batch-user-a-local",
          },
        },
      });

      expect(response.errors?.[0]?.message).toBeDefined();
    });
  });

  describe("API token catalog scope", () => {
    it("QUERY token reads GLOBAL and own LOCAL skills", async () => {
      const response = await graphqlRequest<{
        findManySkills: {
          found: number;
          nodes: Array<{ slug: string; partition: CatalogPartition }>;
        };
      }>(app, {
        apiKey: queryApiToken,
        query: `
          query FindManySkills {
            findManySkills {
              found
              nodes { slug partition }
            }
          }
        `,
      });

      expect(response.errors).toBeUndefined();
      const slugs = response.data?.findManySkills.nodes.map(
        (node) => node.slug
      );
      expect(slugs).toContain("batch-global-skill");
      expect(slugs).toContain("batch-user-a-local");
      expect(slugs).not.toContain("batch-user-b-local");
    });

    it("QUERY token cannot read another users LOCAL skill via findManySkillById", async () => {
      const response = await graphqlRequest<{
        findManySkillById: Array<{ id: string }>;
      }>(app, {
        apiKey: queryApiToken,
        query: `
          query FindManySkillById($skillIds: [ID!]!) {
            findManySkillById(skillIds: $skillIds) { id }
          }
        `,
        variables: { skillIds: [userBLocalSkillId] },
      });

      expect(response.errors).toBeUndefined();
      expect(response.data?.findManySkillById).toEqual([]);
    });
  });
});
