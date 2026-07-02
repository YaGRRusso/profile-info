import { INestApplication } from "@nestjs/common";
import { testAuthContext } from "@test/fixtures/auth-context";
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
import { clearTestDatabase } from "../support/clear-test-database";
import { createTestApp } from "../support/create-test-app";
import { graphqlRequest } from "../support/graphql-request";

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
          name
        }
        roles {
          skills {
            id
            name
          }
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
          name
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
          name
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
          name
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
      skills: Array<{ id: string; name: string }>;
    }>;
  };
  educations: {
    found: number;
    nodes: Array<{
      id: string;
      slug: string;
      owner: { id: string; email: string };
      organization: { id: string; name: string };
      skills: Array<{ id: string; name: string }>;
    }>;
  };
  experiences: {
    found: number;
    nodes: Array<{
      id: string;
      slug: string;
      owner: { id: string; email: string };
      organization: { id: string; name: string };
      skills: Array<{ id: string; name: string }>;
      roles: Array<{ skills: Array<{ id: string; name: string }> }>;
    }>;
  };
  projects: {
    found: number;
    nodes: Array<{
      id: string;
      slug: string;
      owner: { id: string; email: string };
      skills: Array<{ id: string; name: string }>;
    }>;
  };
}

const crossTenantFindOneCases = [
  {
    entity: "experience",
    query: `
      query FindOneExperienceById($experienceId: ID!) {
        findOneExperienceById(experienceId: $experienceId) {
          id
          slug
          owner { email }
          organization { name }
          skills { name }
        }
      }
    `,
    variableName: "experienceId",
    dataKey: "findOneExperienceById",
  },
  {
    entity: "course",
    query: `
      query FindOneCourseById($courseId: ID!) {
        findOneCourseById(courseId: $courseId) {
          id
          slug
          owner { email }
          organization { name }
          skills { name }
        }
      }
    `,
    variableName: "courseId",
    dataKey: "findOneCourseById",
  },
  {
    entity: "education",
    query: `
      query FindOneEducationById($educationId: ID!) {
        findOneEducationById(educationId: $educationId) {
          id
          slug
          owner { email }
          organization { name }
          skills { name }
        }
      }
    `,
    variableName: "educationId",
    dataKey: "findOneEducationById",
  },
  {
    entity: "project",
    query: `
      query FindOneProjectById($projectId: ID!) {
        findOneProjectById(projectId: $projectId) {
          id
          slug
          owner { email }
          skills { name }
        }
      }
    `,
    variableName: "projectId",
    dataKey: "findOneProjectById",
  },
] as const;

const crossTenantFindManyByIdCases = [
  {
    entity: "experience",
    query: `
      query FindManyExperienceById($experienceIds: [ID!]!) {
        findManyExperienceById(experienceIds: $experienceIds) {
          id
          slug
          owner { email }
          organization { name }
          skills { name }
        }
      }
    `,
    variableName: "experienceIds",
    dataKey: "findManyExperienceById",
  },
  {
    entity: "course",
    query: `
      query FindManyCourseById($courseIds: [ID!]!) {
        findManyCourseById(courseIds: $courseIds) {
          id
          slug
          owner { email }
          organization { name }
          skills { name }
        }
      }
    `,
    variableName: "courseIds",
    dataKey: "findManyCourseById",
  },
  {
    entity: "education",
    query: `
      query FindManyEducationById($educationIds: [ID!]!) {
        findManyEducationById(educationIds: $educationIds) {
          id
          slug
          owner { email }
          organization { name }
          skills { name }
        }
      }
    `,
    variableName: "educationIds",
    dataKey: "findManyEducationById",
  },
  {
    entity: "project",
    query: `
      query FindManyProjectById($projectIds: [ID!]!) {
        findManyProjectById(projectIds: $projectIds) {
          id
          slug
          owner { email }
          skills { name }
        }
      }
    `,
    variableName: "projectIds",
    dataKey: "findManyProjectById",
  },
] as const;

describe("Cross-tenant DataLoader isolation (e2e)", () => {
  let app: INestApplication<App>;
  let userBToken: string;
  let organizationId: string;
  let organizationName: string;
  let skillId: string;
  let skillName: string;
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
    app = testApp.app;
    await clearTestDatabase(testApp.module);

    const usersService = testApp.module.get(UsersService);
    const organizationsService = testApp.module.get(OrganizationsService);
    const skillsService = testApp.module.get(SkillsService);
    const experiencesService = testApp.module.get(ExperiencesService);
    const coursesService = testApp.module.get(CoursesService);
    const educationsService = testApp.module.get(EducationsService);
    const projectsService = testApp.module.get(ProjectsService);

    await usersService.createOne({
      name: "Admin",
      nickname: "admin",
      email: "admin@profile.info",
      password: "pass.123",
      role: UserRole.SUPER_ADMIN,
    });

    const alice = await usersService.createOne({
      name: "Alice",
      nickname: "alice",
      email: "alice@profile.info",
      password: "alice.pass",
      role: UserRole.USER,
    });

    const bob = await usersService.createOne({
      name: "Bob",
      nickname: "bob",
      email: "bob@profile.info",
      password: "bob.pass",
      role: UserRole.USER,
    });
    bobUserId = bob.id;

    const organization = await organizationsService.createOne({
      slug: "shared-org",
      name: "Shared Org",
      website: "https://shared.example",
      logo: "https://shared.example/logo.png",
      category: OrganizationCategory.COMPANY,
      i18n: [
        { locale: "en", messages: { description: "Shared organization" } },
      ],
    });
    organizationId = organization.id;
    organizationName = organization.name;

    const skill = await skillsService.createOne({
      slug: "shared-skill",
      name: "Shared Skill",
      category: "Programming",
    });
    skillId = skill.id;
    skillName = skill.name;

    const aliceCtx = testAuthContext({ id: alice.id });
    const bobCtx = testAuthContext({ id: bob.id });

    const rolePayload = {
      i18n: [
        {
          locale: "en",
          messages: { title: "Engineer", description: "Built APIs" },
        },
      ],
      skillIds: [skillId],
    };

    const [aliceExperience, bobExperience] = await Promise.all([
      experiencesService.createOne(aliceCtx, {
        slug: "shared-exp",
        organizationId,
        category: ExperienceCategory.FULL_TIME,
        roles: [rolePayload],
      }),
      experiencesService.createOne(bobCtx, {
        slug: "shared-exp",
        organizationId,
        category: ExperienceCategory.FULL_TIME,
        roles: [rolePayload],
      }),
    ]);

    const localizedContent = {
      i18n: [
        {
          locale: "en",
          messages: {
            title: "Shared title",
            description: "Shared description",
          },
        },
      ],
    };

    const [aliceCourse, bobCourse] = await Promise.all([
      coursesService.createOne(aliceCtx, {
        slug: "shared-course",
        organizationId,
        status: CourseStatus.COMPLETE,
        skillIds: [skillId],
        ...localizedContent,
      }),
      coursesService.createOne(bobCtx, {
        slug: "shared-course",
        organizationId,
        status: CourseStatus.COMPLETE,
        skillIds: [skillId],
        ...localizedContent,
      }),
    ]);

    const [aliceEducation, bobEducation] = await Promise.all([
      educationsService.createOne(aliceCtx, {
        slug: "shared-education",
        organizationId,
        level: EducationLevel.BACHELOR,
        status: EducationStatus.COMPLETE,
        skillIds: [skillId],
        ...localizedContent,
      }),
      educationsService.createOne(bobCtx, {
        slug: "shared-education",
        organizationId,
        level: EducationLevel.BACHELOR,
        status: EducationStatus.COMPLETE,
        skillIds: [skillId],
        ...localizedContent,
      }),
    ]);

    const [aliceProject, bobProject] = await Promise.all([
      projectsService.createOne(aliceCtx, {
        slug: "shared-project",
        skillIds: [skillId],
        ...localizedContent,
      }),
      projectsService.createOne(bobCtx, {
        slug: "shared-project",
        skillIds: [skillId],
        ...localizedContent,
      }),
    ]);

    aliceEntityIds = {
      experienceId: aliceExperience.id,
      courseId: aliceCourse.id,
      educationId: aliceEducation.id,
      projectId: aliceProject.id,
    };
    bobEntityIds = {
      experienceId: bobExperience.id,
      courseId: bobCourse.id,
      educationId: bobEducation.id,
      projectId: bobProject.id,
    };

    const signIn = await graphqlRequest<{ signIn: string }>(app, {
      query: `
        mutation SignIn($signInInput: SignInInput!) {
          signIn(signInInput: $signInInput)
        }
      `,
      variables: {
        signInInput: { email: "bob@profile.info", password: "bob.pass" },
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
    const data = response.data;
    expect(data).toBeDefined();

    for (const collection of [
      data!.experiences,
      data!.courses,
      data!.educations,
      data!.projects,
    ]) {
      expect(collection.found).toBe(1);
      expect(collection.nodes).toHaveLength(1);
      expect(collection.nodes[0]?.owner.email).toBe("bob@profile.info");
      expect(collection.nodes[0]?.owner.id).toBe(bobUserId);
      expect(collection.nodes[0]?.skills).toEqual([
        { id: skillId, name: skillName },
      ]);
    }

    expect(data!.experiences.nodes[0]?.organization).toEqual({
      id: organizationId,
      name: organizationName,
    });
    expect(data!.courses.nodes[0]?.organization).toEqual({
      id: organizationId,
      name: organizationName,
    });
    expect(data!.educations.nodes[0]?.organization).toEqual({
      id: organizationId,
      name: organizationName,
    });
    expect(data!.experiences.nodes[0]?.roles[0]?.skills).toEqual([
      { id: skillId, name: skillName },
    ]);
  });

  it.each(
    crossTenantFindOneCases
  )("should not expose another tenant $entity via findOneById with nested catalog fields", async ({
    query,
    variableName,
    dataKey,
    entity,
  }) => {
    const entityId =
      aliceEntityIds[`${entity}Id` as keyof typeof aliceEntityIds];

    const response = await graphqlRequest(app, {
      query,
      variables: { [variableName]: entityId },
      token: userBToken,
    });

    expect(response.errors?.[0]?.message).toContain("Not Found");
    expect(response.data?.[dataKey]).toBeUndefined();
  });

  it.each(
    crossTenantFindManyByIdCases
  )("should scope findManyById to the caller tenant when nested catalog fields are requested ($entity)", async ({
    query,
    variableName,
    dataKey,
    entity,
  }) => {
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
      variables: { [variableName]: [aliceId, bobId] },
      token: userBToken,
    });

    expect(response.errors).toBeUndefined();
    const nodes = response.data?.[dataKey];
    expect(nodes).toHaveLength(1);
    expect(nodes?.[0]?.id).toBe(bobId);
    expect(nodes?.[0]?.owner.email).toBe("bob@profile.info");
  });
});
