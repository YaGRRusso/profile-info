import { INestApplication } from "@nestjs/common";
import { App } from "supertest/types";
import { UserRole } from "@/core/enums/user-role.enum";
import { CreateExperienceInput } from "@/modules/experiences/dto/create-experience.input";
import { ExperienceCategory } from "@/modules/experiences/enums/category.enum";
import { ExperiencesService } from "@/modules/experiences/experiences.service";
import { OrganizationCategory } from "@/modules/organizations/enums/category.enum";
import { OrganizationsService } from "@/modules/organizations/organizations.service";
import { SkillCategory } from "@/modules/skills/enums/category.enum";
import { SkillsService } from "@/modules/skills/skills.service";
import { UsersService } from "@/modules/users/users.service";
import { clearTestDatabase } from "../support/clear-test-database";
import { createTestApp } from "../support/create-test-app";
import { graphqlRequest } from "../support/graphql-request";

describe("GraphQL (e2e)", () => {
  let app: INestApplication<App>;
  let adminToken: string;
  let userToken: string;
  let usersService: UsersService;
  let organizationsService: OrganizationsService;
  let experiencesService: ExperiencesService;
  let skillsService: SkillsService;
  let portfolioUserId: string;

  beforeAll(async () => {
    const testApp = await createTestApp();
    app = testApp.app;
    await clearTestDatabase(testApp.module);
    usersService = testApp.module.get(UsersService);
    organizationsService = testApp.module.get(OrganizationsService);
    experiencesService = testApp.module.get(ExperiencesService);
    skillsService = testApp.module.get(SkillsService);

    await usersService.createOne({
      name: "Admin",
      nickname: "admin",
      email: "admin@profile.info",
      password: "pass.123",
      role: UserRole.SUPER_ADMIN,
    });

    const user = await usersService.createOne({
      name: "User",
      nickname: "user",
      email: "user@profile.info",
      password: "user.123",
      role: UserRole.USER,
    });
    portfolioUserId = user._id.toString();

    const adminSignIn = await graphqlRequest<{ signIn: string }>(app, {
      query: `
        mutation SignIn($signInInput: SignInInput!) {
          signIn(signInInput: $signInInput)
        }
      `,
      variables: {
        signInInput: { email: "admin@profile.info", password: "pass.123" },
      },
    });

    adminToken = adminSignIn.data?.signIn ?? "";

    const userSignIn = await graphqlRequest<{ signIn: string }>(app, {
      query: `
        mutation SignIn($signInInput: SignInInput!) {
          signIn(signInInput: $signInInput)
        }
      `,
      variables: {
        signInInput: { email: "user@profile.info", password: "user.123" },
      },
    });

    userToken = userSignIn.data?.signIn ?? "";
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it("should return UNAUTHENTICATED when calling a protected mutation without a token", async () => {
    const response = await graphqlRequest(app, {
      query: `
        mutation CreateOneSkill($createSkillInput: CreateSkillInput!) {
          createOneSkill(createSkillInput: $createSkillInput) {
            id
          }
        }
      `,
      variables: {
        createSkillInput: {
          slug: "graphql-skill",
          name: "GraphQL",
          category: "LANGUAGE",
        },
      },
    });

    expect(response.errors?.[0]?.extensions?.code).toBe("UNAUTHENTICATED");
  });

  it("should forbid non-admin users from mutations", async () => {
    const response = await graphqlRequest(app, {
      query: `
        mutation CreateOneSkill($createSkillInput: CreateSkillInput!) {
          createOneSkill(createSkillInput: $createSkillInput) {
            id
          }
        }
      `,
      variables: {
        createSkillInput: {
          slug: "forbidden-skill",
          name: "Forbidden",
          category: "LANGUAGE",
        },
      },
      token: userToken,
    });

    expect(response.errors?.[0]?.message).toContain("Insufficient permissions");
  });

  it("should return UNAUTHENTICATED when calling updateMe without a token", async () => {
    const response = await graphqlRequest(app, {
      query: `
        mutation UpdateMe($updateMeInput: UpdateMeInput!) {
          updateMe(updateMeInput: $updateMeInput) {
            id
          }
        }
      `,
      variables: {
        updateMeInput: { phone: "+5511999999999" },
      },
    });

    expect(response.errors?.[0]?.extensions?.code).toBe("UNAUTHENTICATED");
  });

  it("should allow authenticated users to update their own profile via updateMe", async () => {
    const response = await graphqlRequest<{
      updateMe: { id: string; phone: string };
    }>(app, {
      query: `
        mutation UpdateMe($updateMeInput: UpdateMeInput!) {
          updateMe(updateMeInput: $updateMeInput) {
            id
            phone
          }
        }
      `,
      variables: {
        updateMeInput: { phone: "+5511999999999" },
      },
      token: userToken,
    });

    expect(response.errors).toBeUndefined();
    expect(response.data?.updateMe.phone).toBe("+5511999999999");
  });

  it("should allow admin to create a skill", async () => {
    const response = await graphqlRequest<{
      createOneSkill: { id: string; name: string };
    }>(app, {
      query: `
        mutation CreateOneSkill($createSkillInput: CreateSkillInput!) {
          createOneSkill(createSkillInput: $createSkillInput) {
            id
            name
          }
        }
      `,
      variables: {
        createSkillInput: {
          slug: "nestjs-skill",
          name: "NestJS",
          category: "BACKEND",
        },
      },
      token: adminToken,
    });

    expect(response.errors).toBeUndefined();
    expect(response.data?.createOneSkill.name).toBe("NestJS");
  });

  it("should resolve nested organization via DataLoader on public read", async () => {
    const organization = await organizationsService.createOne({
      slug: "nested-org",
      name: "Nested Org",
      website: "https://nested.example",
      logo: "https://nested.example/logo.png",
      category: OrganizationCategory.COMPANY,
      i18n: [
        {
          locale: "en",
          messages: { description: "Nested organization" },
        },
      ],
    });

    const experience = await experiencesService.createOne(null, {
      slug: "nested-experience",
      ownerId: portfolioUserId,
      organizationId: organization._id.toString(),
      category: ExperienceCategory.FULL_TIME,
      roles: [
        {
          i18n: [
            {
              locale: "en",
              messages: {
                title: "Engineer",
                description: "Built APIs",
              },
            },
          ],
        },
      ],
    } as CreateExperienceInput & { ownerId: string });

    await skillsService.createOne({
      slug: "loader-skill",
      name: "Loader Skill",
      category: SkillCategory.LANGUAGE,
    });

    const response = await graphqlRequest<{
      findOneExperienceById: {
        id: string;
        organization: { id: string; name: string };
      };
    }>(app, {
      query: `
        query FindOneExperienceById($experienceId: ID!) {
          findOneExperienceById(experienceId: $experienceId) {
            id
            organization {
              id
              name
            }
          }
        }
      `,
      variables: { experienceId: experience._id.toString() },
    });

    expect(response.errors).toBeUndefined();
    expect(response.data?.findOneExperienceById.organization.name).toBe(
      "Nested Org"
    );
    expect(response.data?.findOneExperienceById.organization.id).toBe(
      organization._id.toString()
    );
  });
});
