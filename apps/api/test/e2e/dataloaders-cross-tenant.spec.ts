import { INestApplication } from "@nestjs/common";
import {
  testAuthContext,
  testSuperAdminContext,
} from "@test/fixtures/auth-context";
import { App } from "supertest/types";
import { UserRole } from "@/core/enums/user-role.enum";
import { CoursesService } from "@/modules/courses/courses.service";
import { CourseStatus } from "@/modules/courses/enums/status.enum";
import { EducationsService } from "@/modules/educations/educations.service";
import { EducationLevel } from "@/modules/educations/enums/level.enum";
import { EducationStatus } from "@/modules/educations/enums/status.enum";
import { ExperienceCategory } from "@/modules/experiences/enums/category.enum";
import { ExperiencesService } from "@/modules/experiences/experiences.service";
import { OrganizationCategory } from "@/modules/organizations/enums/category.enum";
import { OrganizationsService } from "@/modules/organizations/organizations.service";
import { ProjectsService } from "@/modules/projects/projects.service";
import { SkillsService } from "@/modules/skills/skills.service";
import { UsersService } from "@/modules/users/users.service";
import { assertDefined } from "../support/assert-defined";
import { clearTestDatabase } from "../support/clear-test-database";
import { createTestApp } from "../support/create-test-app";
import { NOT_FOUND_MESSAGE } from "../support/error-message-matchers";
import { graphqlRequest } from "../support/graphql-request";
import { skillI18n } from "../support/skill-i18n";

const NESTED_PRIVATE_ENTITIES = `
  query NestedPrivateEntities {
    experiences: findManyExperiences {
      found
      nodes {
        id
        slug
        owner {
          id
          email
        }
        organization {
          id
          name
        }
        skills {
          id
          slug
        }
      }
    }
    courses: findManyCourses {
      found
      nodes {
        id
        slug
        owner {
          id
          email
        }
        organization {
          id
          name
        }
        skills {
          id
          slug
        }
      }
    }
    educations: findManyEducations {
      found
      nodes {
        id
        slug
        owner {
          id
          email
        }
        organization {
          id
          name
        }
        skills {
          id
          slug
        }
      }
    }
    projects: findManyProjects {
      found
      nodes {
        id
        slug
        owner {
          id
          email
        }
        skills {
          id
          slug
        }
      }
    }
  }
`;

interface NestedPrivateEntitiesData {
  courses: {
    found: number;
    nodes: Array<{
      id: string;
      slug: string;
      owner: { id: string; email: string };
      organization: { id: string; name: string };
      skills: Array<{ id: string; slug: string }>;
    }>;
  };
  educations: {
    found: number;
    nodes: Array<{
      id: string;
      slug: string;
      owner: { id: string; email: string };
      organization: { id: string; name: string };
      skills: Array<{ id: string; slug: string }>;
    }>;
  };
  experiences: {
    found: number;
    nodes: Array<{
      id: string;
      slug: string;
      owner: { id: string; email: string };
      organization: { id: string; name: string };
      skills: Array<{ id: string; slug: string }>;
    }>;
  };
  projects: {
    found: number;
    nodes: Array<{
      id: string;
      slug: string;
      owner: { id: string; email: string };
      skills: Array<{ id: string; slug: string }>;
    }>;
  };
}

const crossTenantFindOneCases = [
  {
    dataKey: "findOneExperienceById",
    entity: "experience",
    query: `
      query FindOneExperienceById($experienceId: ID!) {
        findOneExperienceById(experienceId: $experienceId) {
          id
          slug
          owner { email }
          organization { name }
          skills { id slug }
        }
      }
    `,
    variableName: "experienceId",
  },
  {
    dataKey: "findOneCourseById",
    entity: "course",
    query: `
      query FindOneCourseById($courseId: ID!) {
        findOneCourseById(courseId: $courseId) {
          id
          slug
          owner { email }
          organization { name }
          skills { id slug }
        }
      }
    `,
    variableName: "courseId",
  },
  {
    dataKey: "findOneEducationById",
    entity: "education",
    query: `
      query FindOneEducationById($educationId: ID!) {
        findOneEducationById(educationId: $educationId) {
          id
          slug
          owner { email }
          organization { name }
          skills { id slug }
        }
      }
    `,
    variableName: "educationId",
  },
  {
    dataKey: "findOneProjectById",
    entity: "project",
    query: `
      query FindOneProjectById($projectId: ID!) {
        findOneProjectById(projectId: $projectId) {
          id
          slug
          owner { email }
          skills { id slug }
        }
      }
    `,
    variableName: "projectId",
  },
] as const;

const crossTenantFindManyByIdCases = [
  {
    dataKey: "findManyExperienceById",
    entity: "experience",
    query: `
      query FindManyExperienceById($experienceIds: [ID!]!) {
        findManyExperienceById(experienceIds: $experienceIds) {
          id
          slug
          owner { email }
          organization { name }
          skills { id slug }
        }
      }
    `,
    variableName: "experienceIds",
  },
  {
    dataKey: "findManyCourseById",
    entity: "course",
    query: `
      query FindManyCourseById($courseIds: [ID!]!) {
        findManyCourseById(courseIds: $courseIds) {
          id
          slug
          owner { email }
          organization { name }
          skills { id slug }
        }
      }
    `,
    variableName: "courseIds",
  },
  {
    dataKey: "findManyEducationById",
    entity: "education",
    query: `
      query FindManyEducationById($educationIds: [ID!]!) {
        findManyEducationById(educationIds: $educationIds) {
          id
          slug
          owner { email }
          organization { name }
          skills { id slug }
        }
      }
    `,
    variableName: "educationIds",
  },
  {
    dataKey: "findManyProjectById",
    entity: "project",
    query: `
      query FindManyProjectById($projectIds: [ID!]!) {
        findManyProjectById(projectIds: $projectIds) {
          id
          slug
          owner { email }
          skills { id slug }
        }
      }
    `,
    variableName: "projectIds",
  },
] as const;

describe("Cross-tenant DataLoader isolation (e2e)", () => {
  let app: INestApplication<App>;
  let userBToken: string;
  let organizationId: string;
  let organizationName: string;
  let skillId: string;
  let skillSlug: string;
  let bobUserId: string;
  let aliceEntityIds: {
    experienceId: string;
    courseId: string;
    educationId: string;
    projectId: string;
  };
  let bobEntityIds: {
    experienceId: string;
    courseId: string;
    educationId: string;
    projectId: string;
  };

  beforeAll(async () => {
    const testApp = await createTestApp();
    ({ app } = testApp);
    await clearTestDatabase(testApp.module);

    const usersService = testApp.module.get(UsersService);
    const organizationsService = testApp.module.get(OrganizationsService);
    const skillsService = testApp.module.get(SkillsService);
    const experiencesService = testApp.module.get(ExperiencesService);
    const coursesService = testApp.module.get(CoursesService);
    const educationsService = testApp.module.get(EducationsService);
    const projectsService = testApp.module.get(ProjectsService);

    await usersService.createOne(testSuperAdminContext(), {
      email: "admin@profile.info",
      name: "Admin",
      nickname: "admin",
      password: "123123",
      role: UserRole.SUPER_ADMIN,
    });

    const joao = await usersService.createOne(testSuperAdminContext(), {
      email: "joao@profile.info",
      name: "João",
      nickname: "joao",
      password: "123123",
      role: UserRole.USER,
    });

    const bob = await usersService.createOne(testSuperAdminContext(), {
      email: "maria@profile.info",
      name: "Maria",
      nickname: "maria",
      password: "123123",
      role: UserRole.USER,
    });
    bobUserId = bob.id;

    const organization = await organizationsService.createOne(
      testSuperAdminContext(),
      {
        category: OrganizationCategory.COMPANY,
        i18n: [
          { locale: "en", messages: { description: "Shared organization" } },
        ],
        logo: "https://shared.example/logo.png",
        name: "Shared Org",
        slug: "shared-org",
        website: "https://shared.example",
      }
    );
    organizationId = organization.id;
    organizationName = organization.name;

    const skill = await skillsService.createOne(testSuperAdminContext(), {
      category: "Programming",
      i18n: skillI18n("Shared Skill"),
      slug: "shared-skill",
    });
    skillId = skill.id;
    assertDefined(skill.slug);
    skillSlug = skill.slug;

    const joaoCtx = testAuthContext({ id: joao.id });
    const bobCtx = testAuthContext({ id: bob.id });

    const experiencePayload = {
      i18n: [
        {
          locale: "en",
          messages: { description: "Built APIs", title: "Engineer" },
        },
      ],
      skillIds: [skillId],
    };

    const [aliceExperience, bobExperience] = await Promise.all([
      experiencesService.createOne(joaoCtx, {
        category: ExperienceCategory.FULL_TIME,
        organizationId,
        slug: "shared-exp",
        ...experiencePayload,
      }),
      experiencesService.createOne(bobCtx, {
        category: ExperienceCategory.FULL_TIME,
        organizationId,
        slug: "shared-exp",
        ...experiencePayload,
      }),
    ]);

    const localizedContent = {
      i18n: [
        {
          locale: "en",
          messages: {
            description: "Shared description",
            title: "Shared title",
          },
        },
      ],
    };

    const [aliceCourse, bobCourse] = await Promise.all([
      coursesService.createOne(joaoCtx, {
        organizationId,
        skillIds: [skillId],
        slug: "shared-course",
        status: CourseStatus.COMPLETE,
        ...localizedContent,
      }),
      coursesService.createOne(bobCtx, {
        organizationId,
        skillIds: [skillId],
        slug: "shared-course",
        status: CourseStatus.COMPLETE,
        ...localizedContent,
      }),
    ]);

    const [aliceEducation, bobEducation] = await Promise.all([
      educationsService.createOne(joaoCtx, {
        level: EducationLevel.BACHELOR,
        organizationId,
        skillIds: [skillId],
        slug: "shared-education",
        status: EducationStatus.COMPLETE,
        ...localizedContent,
      }),
      educationsService.createOne(bobCtx, {
        level: EducationLevel.BACHELOR,
        organizationId,
        skillIds: [skillId],
        slug: "shared-education",
        status: EducationStatus.COMPLETE,
        ...localizedContent,
      }),
    ]);

    const [aliceProject, bobProject] = await Promise.all([
      projectsService.createOne(joaoCtx, {
        skillIds: [skillId],
        slug: "shared-project",
        ...localizedContent,
      }),
      projectsService.createOne(bobCtx, {
        skillIds: [skillId],
        slug: "shared-project",
        ...localizedContent,
      }),
    ]);

    aliceEntityIds = {
      courseId: aliceCourse.id,
      educationId: aliceEducation.id,
      experienceId: aliceExperience.id,
      projectId: aliceProject.id,
    };
    bobEntityIds = {
      courseId: bobCourse.id,
      educationId: bobEducation.id,
      experienceId: bobExperience.id,
      projectId: bobProject.id,
    };

    const signIn = await graphqlRequest<{ signIn: string }>(app, {
      query: `
        mutation SignIn($signInInput: SignInInput!) {
          signIn(signInInput: $signInInput)
        }
      `,
      variables: {
        signInInput: { email: "maria@profile.info", password: "123123" },
      },
    });
    userBToken = signIn.data?.signIn ?? "";
  });

  afterAll(async () => {
    await app?.close();
  });

  it("should resolve nested catalog fields only for the caller tenant in one batched query", async () => {
    const response = await graphqlRequest<NestedPrivateEntitiesData>(app, {
      query: NESTED_PRIVATE_ENTITIES,
      token: userBToken,
    });

    expect(response.errors).toBeUndefined();
    const { data } = response;
    assertDefined(data);

    for (const collection of [
      data.experiences,
      data.courses,
      data.educations,
      data.projects,
    ]) {
      expect(collection.found).toBe(1);
      expect(collection.nodes).toHaveLength(1);
      expect(collection.nodes[0]?.owner.email).toBe("maria@profile.info");
      expect(collection.nodes[0]?.owner.id).toBe(bobUserId);
      expect(collection.nodes[0]?.skills).toEqual([
        { id: skillId, slug: skillSlug },
      ]);
    }

    expect(data.experiences.nodes[0]?.organization).toEqual({
      id: organizationId,
      name: organizationName,
    });
    expect(data.courses.nodes[0]?.organization).toEqual({
      id: organizationId,
      name: organizationName,
    });
    expect(data.educations.nodes[0]?.organization).toEqual({
      id: organizationId,
      name: organizationName,
    });
  });

  it.each(crossTenantFindOneCases)(
    "should not expose another tenant $entity via findOneById with nested catalog fields",
    async ({ query, variableName, dataKey, entity }) => {
      const entityId =
        aliceEntityIds[`${entity}Id` as keyof typeof aliceEntityIds];

      const response = await graphqlRequest(app, {
        query,
        token: userBToken,
        variables: { [variableName]: entityId },
      });

      expect(response.errors?.[0]?.message).toMatch(NOT_FOUND_MESSAGE);
      expect(response.data?.[dataKey]).toBeUndefined();
    }
  );

  it.each(crossTenantFindManyByIdCases)(
    "should scope findManyById to the caller tenant when nested catalog fields are requested ($entity)",
    async ({ query, variableName, dataKey, entity }) => {
      const aliceId =
        aliceEntityIds[`${entity}Id` as keyof typeof aliceEntityIds];
      const bobId = bobEntityIds[`${entity}Id` as keyof typeof bobEntityIds];

      const response = await graphqlRequest<
        Record<
          string,
          Array<{ id: string; slug: string; owner: { email: string } }>
        >
      >(app, {
        query,
        token: userBToken,
        variables: { [variableName]: [aliceId, bobId] },
      });

      expect(response.errors).toBeUndefined();
      const nodes = response.data?.[dataKey];
      expect(nodes).toHaveLength(1);
      expect(nodes?.[0]?.id).toBe(bobId);
      expect(nodes?.[0]?.owner.email).toBe("maria@profile.info");
    }
  );
});
