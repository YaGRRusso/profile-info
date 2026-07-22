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
import { UsersService } from "@/modules/users/users.service";
import { clearTestDatabase } from "../support/clear-test-database";
import { createTestApp } from "../support/create-test-app";
import { graphqlRequest } from "../support/graphql-request";

const FIND_MANY_GROUPED_EXPERIENCES = `
  query FindManyGroupedExperiences(
    $experiencePagination: PaginationInput
    $experienceSort: SortGroupedExperienceInput
  ) {
    findManyGroupedExperiences(
      experiencePagination: $experiencePagination
      experienceSort: $experienceSort
    ) {
      found
      nodes {
        organizationId
        relevance
        experiences {
          id
          slug
        }
        organization {
          id
          name
        }
      }
    }
  }
`;

const FIND_ONE_GROUPED_EXPERIENCE = `
  query FindOneGroupedExperience(
    $experienceFilters: FilterExperienceInput
    $experienceSort: SortGroupedExperienceInput
  ) {
    findOneGroupedExperience(
      experienceFilters: $experienceFilters
      experienceSort: $experienceSort
    ) {
      organizationId
      relevance
      experiences {
        slug
      }
      organization {
        name
      }
    }
  }
`;

describe("grouped experiences (e2e)", () => {
  let app: INestApplication<App>;
  let token: string;
  let orgIds: string[];

  beforeAll(async () => {
    const testApp = await createTestApp();
    ({ app } = testApp);
    await clearTestDatabase(testApp.module);

    const usersService = testApp.module.get(UsersService);
    const organizationsService = testApp.module.get(OrganizationsService);
    const experiencesService = testApp.module.get(ExperiencesService);

    const user = await usersService.createOne(testSuperAdminContext(), {
      email: "grouped@profile.info",
      name: "Grouped",
      nickname: "grouped",
      password: "123123",
      role: UserRole.USER,
    });
    const userCtx = testAuthContext({ id: user.id });

    const signIn = await graphqlRequest<{ signIn: string }>(app, {
      query: `
        mutation SignIn($signInInput: SignInInput!) {
          signIn(signInInput: $signInInput)
        }
      `,
      variables: {
        signInInput: {
          email: "grouped@profile.info",
          password: "123123",
        },
      },
    });
    token = signIn.data?.signIn ?? "";

    const orgs = await Promise.all(
      ["A", "B", "C", "D"].map((name) =>
        organizationsService.createOne(testSuperAdminContext(), {
          category: OrganizationCategory.COMPANY,
          i18n: [{ locale: "en", messages: { description: `Org ${name}` } }],
          name: `Organization ${name}`,
          slug: `organization-${name.toLowerCase()}`,
        })
      )
    );
    orgIds = orgs.map((org) => org.id);

    const roles: Array<{
      organizationId: string;
      relevance: number;
      slug: string;
    }> = [
      { organizationId: orgIds[0], relevance: 10, slug: "role-aa" },
      { organizationId: orgIds[0], relevance: 9, slug: "role-ab" },
      { organizationId: orgIds[0], relevance: 8, slug: "role-ac" },
      { organizationId: orgIds[1], relevance: 5, slug: "role-ba" },
      { organizationId: orgIds[2], relevance: 7, slug: "role-ca" },
      { organizationId: orgIds[2], relevance: 6, slug: "role-cb" },
      { organizationId: orgIds[3], relevance: 3, slug: "role-da" },
      { organizationId: orgIds[3], relevance: 2, slug: "role-db" },
    ];

    await Promise.all(
      roles.map((role) =>
        experiencesService.createOne(userCtx, {
          category: ExperienceCategory.FULL_TIME,
          i18n: [
            {
              locale: "en",
              messages: { description: role.slug, title: role.slug },
            },
          ],
          organizationId: role.organizationId,
          relevance: role.relevance,
          slug: role.slug,
        })
      )
    );
  });

  afterAll(async () => {
    await app?.close();
  });

  it("limits by organization group and returns every role in each group", async () => {
    const response = await graphqlRequest<{
      findManyGroupedExperiences: {
        found: number;
        nodes: Array<{
          organizationId: string;
          relevance: number;
          experiences: Array<{ slug: string }>;
          organization: { name: string };
        }>;
      };
    }>(app, {
      query: FIND_MANY_GROUPED_EXPERIENCES,
      token,
      variables: {
        experiencePagination: { limit: 3 },
        experienceSort: { relevance: "DESC" },
      },
    });

    expect(response.errors).toBeUndefined();
    expect(response.data?.findManyGroupedExperiences.found).toBe(4);
    expect(
      response.data?.findManyGroupedExperiences.nodes.map(
        (node) => node.organizationId
      )
    ).toEqual([orgIds[0], orgIds[2], orgIds[1]]);
    expect(
      response.data?.findManyGroupedExperiences.nodes[0].experiences.map(
        (experience) => experience.slug
      )
    ).toEqual(["role-aa", "role-ab", "role-ac"]);
    expect(
      response.data?.findManyGroupedExperiences.nodes[1].experiences.map(
        (experience) => experience.slug
      )
    ).toEqual(["role-ca", "role-cb"]);
    expect(
      response.data?.findManyGroupedExperiences.nodes[2].experiences.map(
        (experience) => experience.slug
      )
    ).toEqual(["role-ba"]);
    expect(
      response.data?.findManyGroupedExperiences.nodes[0].organization.name
    ).toBe("Organization A");
  });

  it("returns the top organization group for findOneGroupedExperience", async () => {
    const response = await graphqlRequest<{
      findOneGroupedExperience: {
        organizationId: string;
        relevance: number;
        experiences: Array<{ slug: string }>;
        organization: { name: string };
      };
    }>(app, {
      query: FIND_ONE_GROUPED_EXPERIENCE,
      token,
      variables: {
        experienceSort: { relevance: "DESC" },
      },
    });

    expect(response.errors).toBeUndefined();
    expect(response.data?.findOneGroupedExperience.organizationId).toBe(
      orgIds[0]
    );
    expect(
      response.data?.findOneGroupedExperience.experiences.map(
        (experience) => experience.slug
      )
    ).toEqual(["role-aa", "role-ab", "role-ac"]);
    expect(response.data?.findOneGroupedExperience.organization.name).toBe(
      "Organization A"
    );
  });

  it("filters findOneGroupedExperience to a specific organization", async () => {
    const response = await graphqlRequest<{
      findOneGroupedExperience: {
        organizationId: string;
        experiences: Array<{ slug: string }>;
      };
    }>(app, {
      query: FIND_ONE_GROUPED_EXPERIENCE,
      token,
      variables: {
        experienceFilters: { organizationId: orgIds[2] },
      },
    });

    expect(response.errors).toBeUndefined();
    expect(response.data?.findOneGroupedExperience.organizationId).toBe(
      orgIds[2]
    );
    expect(
      response.data?.findOneGroupedExperience.experiences.map(
        (experience) => experience.slug
      )
    ).toEqual(["role-ca", "role-cb"]);
  });
});
