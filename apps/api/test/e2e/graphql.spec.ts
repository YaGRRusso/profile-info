import { INestApplication } from "@nestjs/common";
import {
  testAuthContext,
  testSuperAdminContext,
} from "@test/fixtures/auth-context";
import { App } from "supertest/types";
import { UserRole } from "@/core/enums/user-role.enum";
import { ExperienceCategory } from "@/modules/experiences/enums/category.enum";
import { ExperiencesService } from "@/modules/experiences/experiences.service";
import { OrganizationCategory } from "@/modules/organizations/enums/category.enum";
import { OrganizationsService } from "@/modules/organizations/organizations.service";
import { SkillsService } from "@/modules/skills/skills.service";
import { UsersService } from "@/modules/users/users.service";
import { clearTestDatabase } from "../support/clear-test-database";
import { createTestApp } from "../support/create-test-app";
import { graphqlRequest } from "../support/graphql-request";
import { skillI18n } from "../support/skill-i18n";

describe("GraphQL (e2e)", () => {
  let app: INestApplication<App>;
  let userToken: string;
  let usersService: UsersService;
  let organizationsService: OrganizationsService;
  let experiencesService: ExperiencesService;
  let skillsService: SkillsService;
  let portfolioUserId: string;

  beforeAll(async () => {
    const testApp = await createTestApp();
    ({ app } = testApp);
    await clearTestDatabase(testApp.module);
    usersService = testApp.module.get(UsersService);
    organizationsService = testApp.module.get(OrganizationsService);
    experiencesService = testApp.module.get(ExperiencesService);
    skillsService = testApp.module.get(SkillsService);

    await usersService.createOne(testSuperAdminContext(), {
      email: "admin@profile.info",
      name: "Admin",
      nickname: "admin",
      password: "123123",
      role: UserRole.SUPER_ADMIN,
    });

    const user = await usersService.createOne(testSuperAdminContext(), {
      email: "user@profile.info",
      name: "User",
      nickname: "user",
      password: "user.123",
      role: UserRole.USER,
    });
    portfolioUserId = user.id;

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
          category: "Programming",
          i18n: skillI18n("GraphQL"),
          slug: "graphql-skill",
        },
      },
    });

    expect(response.errors?.[0]?.extensions?.code).toBe("UNAUTHENTICATED");
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
      token: userToken,
      variables: {
        updateMeInput: { phone: "+5511999999999" },
      },
    });

    expect(response.errors).toBeUndefined();
    expect(response.data?.updateMe.phone).toBe("+5511999999999");
  });

  it("should resolve profile skills on getMe", async () => {
    const skill = await skillsService.createOne(testSuperAdminContext(), {
      category: "Programming",
      i18n: skillI18n("Get Me Skill"),
      slug: "get-me-skill",
    });

    await graphqlRequest(app, {
      query: `
        mutation UpdateMe($updateMeInput: UpdateMeInput!) {
          updateMe(updateMeInput: $updateMeInput) {
            id
          }
        }
      `,
      token: userToken,
      variables: {
        updateMeInput: { skillIds: [skill.id] },
      },
    });

    const response = await graphqlRequest<{
      getMe: {
        skillIds: string[];
        skills: Array<{ id: string; slug: string }>;
      };
    }>(app, {
      query: `
        query GetMe {
          getMe {
            skillIds
            skills {
              id
              slug
            }
          }
        }
      `,
      token: userToken,
    });

    expect(response.errors).toBeUndefined();
    expect(response.data?.getMe.skillIds).toEqual([skill.id]);
    expect(response.data?.getMe.skills).toEqual([
      { id: skill.id, slug: "get-me-skill" },
    ]);
  });

  it("should allow authenticated users to set profile skillIds via updateMe", async () => {
    const skill = await skillsService.createOne(testSuperAdminContext(), {
      category: "Programming",
      i18n: skillI18n("Profile Skill"),
      slug: "profile-skill",
    });

    const response = await graphqlRequest<{
      updateMe: {
        id: string;
        skillIds: string[];
        skills: Array<{ id: string; slug: string }>;
      };
    }>(app, {
      query: `
        mutation UpdateMe($updateMeInput: UpdateMeInput!) {
          updateMe(updateMeInput: $updateMeInput) {
            id
            skillIds
            skills {
              id
              slug
            }
          }
        }
      `,
      token: userToken,
      variables: {
        updateMeInput: { skillIds: [skill.id] },
      },
    });

    expect(response.errors).toBeUndefined();
    expect(response.data?.updateMe.skillIds).toEqual([skill.id]);
    expect(response.data?.updateMe.skills).toEqual([
      { id: skill.id, slug: "profile-skill" },
    ]);
  });

  it("should resolve nested organization via DataLoader on authenticated read", async () => {
    const organization = await organizationsService.createOne(
      testSuperAdminContext(),
      {
        category: OrganizationCategory.COMPANY,
        i18n: [
          {
            locale: "en",
            messages: { description: "Nested organization" },
          },
        ],
        logo: "https://nested.example/logo.png",
        name: "Nested Org",
        slug: "nested-org",
        website: "https://nested.example",
      }
    );

    const portfolioCtx = testAuthContext({ id: portfolioUserId });

    const experience = await experiencesService.createOne(portfolioCtx, {
      category: ExperienceCategory.FULL_TIME,
      i18n: [
        {
          locale: "en",
          messages: {
            description: "Built APIs",
            title: "Engineer",
          },
        },
      ],
      organizationId: organization.id,
      slug: "nested-experience",
    });

    await skillsService.createOne(testSuperAdminContext(), {
      category: "Programming",
      i18n: skillI18n("Loader Skill"),
      slug: "loader-skill",
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
      token: userToken,
      variables: { experienceId: experience.id },
    });

    expect(response.errors).toBeUndefined();
    expect(response.data?.findOneExperienceById.organization.name).toBe(
      "Nested Org"
    );
    expect(response.data?.findOneExperienceById.organization.id).toBe(
      organization.id
    );
  });
});
