import { INestApplication } from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import { testSuperAdminContext } from "@test/fixtures/auth-context";
import { Model } from "mongoose";
import { App } from "supertest/types";
import { UserRole } from "@/core/enums/user-role.enum";
import { CourseStatus } from "@/modules/courses/enums/status.enum";
import { CourseModel } from "@/modules/courses/schemas/course.schema";
import { EducationLevel } from "@/modules/educations/enums/level.enum";
import { EducationStatus } from "@/modules/educations/enums/status.enum";
import { EducationModel } from "@/modules/educations/schemas/education.schema";
import { ExperienceCategory } from "@/modules/experiences/enums/category.enum";
import { ExperienceModel } from "@/modules/experiences/schemas/experience.schema";
import { UsersService } from "@/modules/users/users.service";
import { clearTestDatabase } from "../support/clear-test-database";
import { createTestApp } from "../support/create-test-app";
import { graphqlRequest } from "../support/graphql-request";

const FIND_MANY_WITH_ORGANIZATION = `
  query FindManyWithOrganization {
    findManyCourses {
      nodes {
        id
        slug
        organizationId
        organization {
          id
          name
        }
      }
    }
    findManyEducations {
      nodes {
        id
        slug
        organizationId
        organization {
          id
          name
        }
      }
    }
    findManyExperiences {
      nodes {
        id
        slug
        organizationId
        organization {
          id
          name
        }
      }
    }
  }
`;

describe("Organization nullability (integration)", () => {
  let app: INestApplication<App>;
  let userToken: string;
  let ownerId: string;
  let courseModel: Model<CourseModel>;
  let educationModel: Model<EducationModel>;
  let experienceModel: Model<ExperienceModel>;

  beforeAll(async () => {
    const testApp = await createTestApp();
    ({ app } = testApp);
    await clearTestDatabase(testApp.module);

    const usersService = testApp.module.get(UsersService);
    courseModel = testApp.module.get(getModelToken(CourseModel.name));
    educationModel = testApp.module.get(getModelToken(EducationModel.name));
    experienceModel = testApp.module.get(getModelToken(ExperienceModel.name));

    const user = await usersService.createOne(testSuperAdminContext(), {
      email: "owner@profile.info",
      name: "Owner",
      nickname: "owner",
      password: "owner.123",
      role: UserRole.USER,
    });
    ownerId = user.id;

    const signIn = await graphqlRequest<{ signIn: string }>(app, {
      query: `
        mutation SignIn($signInInput: SignInInput!) {
          signIn(signInInput: $signInInput)
        }
      `,
      variables: {
        signInInput: { email: "owner@profile.info", password: "owner.123" },
      },
    });
    userToken = signIn.data?.signIn ?? "";

    await courseModel.create({
      i18n: [
        {
          locale: "en",
          messages: { description: "No organization", title: "Course" },
        },
      ],
      ownerId,
      relevance: 0,
      slug: "course-without-org",
      status: CourseStatus.COMPLETE,
    });

    await educationModel.create({
      i18n: [
        {
          locale: "en",
          messages: { description: "No organization", title: "Education" },
        },
      ],
      level: EducationLevel.BACHELOR,
      ownerId,
      relevance: 0,
      slug: "education-without-org",
      status: EducationStatus.COMPLETE,
    });

    await experienceModel.create({
      category: ExperienceCategory.FULL_TIME,
      ownerId,
      relevance: 0,
      roles: [
        {
          i18n: [
            {
              locale: "en",
              messages: { description: "No organization", title: "Role" },
            },
          ],
        },
      ],
      slug: "experience-without-org",
    });
  });

  afterAll(async () => {
    await app?.close();
  });

  it("should resolve null organization when organizationId is absent in persistence", async () => {
    const response = await graphqlRequest<{
      findManyCourses: {
        nodes: Array<{
          slug: string;
          organizationId?: string | null;
          organization?: { id: string; name: string } | null;
        }>;
      };
      findManyEducations: {
        nodes: Array<{
          slug: string;
          organizationId?: string | null;
          organization?: { id: string; name: string } | null;
        }>;
      };
      findManyExperiences: {
        nodes: Array<{
          slug: string;
          organizationId?: string | null;
          organization?: { id: string; name: string } | null;
        }>;
      };
    }>(app, {
      query: FIND_MANY_WITH_ORGANIZATION,
      token: userToken,
    });

    expect(response.errors).toBeUndefined();

    const course = response.data?.findManyCourses.nodes.find(
      (node) => node.slug === "course-without-org"
    );
    expect(course?.organizationId).toBeNull();
    expect(course?.organization).toBeNull();

    const education = response.data?.findManyEducations.nodes.find(
      (node) => node.slug === "education-without-org"
    );
    expect(education?.organizationId).toBeNull();
    expect(education?.organization).toBeNull();

    const experience = response.data?.findManyExperiences.nodes.find(
      (node) => node.slug === "experience-without-org"
    );
    expect(experience?.organizationId).toBeNull();
    expect(experience?.organization).toBeNull();
  });
});
