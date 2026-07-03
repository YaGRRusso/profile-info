import { faker } from "@faker-js/faker";
import { NestFactory } from "@nestjs/core";
import { getModelToken } from "@nestjs/mongoose";
import { hash } from "bcryptjs";
import type { Model } from "mongoose";
import { AppModule } from "@/app.module";
import { API_TOKEN_PREFIX } from "@/modules/api-tokens/constants/api-token.constants";
import { ApiTokenModel } from "@/modules/api-tokens/schemas/api-token.schema";
import { CourseModel } from "@/modules/courses/schemas/course.schema";
import { EducationModel } from "@/modules/educations/schemas/education.schema";
import { ExperienceModel } from "@/modules/experiences/schemas/experience.schema";
import { OrganizationModel } from "@/modules/organizations/schemas/organization.schema";
import { ProjectModel } from "@/modules/projects/schemas/project.schema";
import { SkillModel } from "@/modules/skills/schemas/skill.schema";
import { UserModel } from "@/modules/users/schemas/user.schema";
import {
  buildCatalogSkills,
  pickProfileSkillIds,
} from "./builders/catalog.builder";
import {
  buildCoursesForPersona,
  buildEducationsForPersona,
  buildExperiencesForPersona,
  buildProjectsForPersona,
} from "./builders/entities.builder";
import { buildCatalogOrganizations } from "./builders/organizations.builder";
import { createPersonaUser } from "./builders/users.builder";
import { DEV_PASSWORD, FAKER_SEED, SEED_API_TOKENS } from "./constants";
import { PERSONA_KEYS, PERSONAS, type PersonaKey } from "./personas";

export async function runSeed(): Promise<void> {
  faker.seed(FAKER_SEED);

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ["error", "warn"],
  });

  const model = <T>(schema: { name: string }) =>
    app.get<Model<T>>(getModelToken(schema.name), { strict: false });

  const skills = model<SkillModel>(SkillModel);
  const organizations = model<OrganizationModel>(OrganizationModel);
  const courses = model<CourseModel>(CourseModel);
  const educations = model<EducationModel>(EducationModel);
  const projects = model<ProjectModel>(ProjectModel);
  const experiences = model<ExperienceModel>(ExperienceModel);
  const users = model<UserModel>(UserModel);
  const apiTokens = model<ApiTokenModel>(ApiTokenModel);

  await Promise.all([
    skills.deleteMany({}),
    organizations.deleteMany({}),
    courses.deleteMany({}),
    educations.deleteMany({}),
    projects.deleteMany({}),
    experiences.deleteMany({}),
    apiTokens.deleteMany({}),
    users.deleteMany({}),
  ]);

  const skillDocs = await skills.create(buildCatalogSkills());
  const skillIds = skillDocs.map((doc) => String(doc._id));

  const organizationDocs = await organizations.create(
    buildCatalogOrganizations()
  );
  const organizationIds = organizationDocs.map((doc) => String(doc._id));

  const userDocs: Record<
    PersonaKey,
    Awaited<ReturnType<typeof createPersonaUser>>
  > = {} as never;

  for (const key of PERSONA_KEYS) {
    const persona = PERSONAS[key];
    const profileSkillIds = pickProfileSkillIds(
      skillIds,
      persona.profileSkillCount
    );

    userDocs[key] = await createPersonaUser(users, persona, profileSkillIds);
  }

  let entityOffset = 0;

  for (const key of PERSONA_KEYS) {
    const persona = PERSONAS[key];
    const ownerId = String(userDocs[key]._id);

    if (persona.entities.courses > 0) {
      await courses.create(
        buildCoursesForPersona(
          ownerId,
          persona.entities,
          organizationIds,
          skillIds,
          entityOffset
        )
      );
    }

    if (persona.entities.educations > 0) {
      await educations.create(
        buildEducationsForPersona(
          ownerId,
          persona.entities,
          organizationIds,
          skillIds,
          entityOffset + 100
        )
      );
    }

    if (persona.entities.projects > 0) {
      await projects.create(
        buildProjectsForPersona(
          ownerId,
          persona.entities,
          skillIds,
          entityOffset + 200
        )
      );
    }

    if (persona.entities.experiences > 0) {
      await experiences.create(
        buildExperiencesForPersona(
          ownerId,
          persona.entities,
          organizationIds,
          skillIds,
          entityOffset + 300
        )
      );
    }

    entityOffset += 500;
  }

  const ownersByKey = Object.fromEntries(
    PERSONA_KEYS.map((key) => [key, userDocs[key]._id])
  ) as Record<PersonaKey, (typeof userDocs)[PersonaKey]["_id"]>;

  await apiTokens.create(
    await Promise.all(
      SEED_API_TOKENS.map(async (token) => ({
        _id: token.id,
        ownerId: ownersByKey[token.owner],
        name: token.name,
        hashedSecret: await hash(token.secret, 8),
        permissions: [...token.permissions],
      }))
    )
  );

  const counts = {
    skills: await skills.countDocuments(),
    organizations: await organizations.countDocuments(),
    courses: await courses.countDocuments(),
    educations: await educations.countDocuments(),
    projects: await projects.countDocuments(),
    experiences: await experiences.countDocuments(),
    users: await users.countDocuments(),
    apiTokens: await apiTokens.countDocuments(),
  };

  console.info(`faker.seed(${FAKER_SEED})`);
  console.info(`password for all personas: ${DEV_PASSWORD}`);
  for (const key of PERSONA_KEYS) {
    const persona = PERSONAS[key];
    console.info(
      `${persona.email} / ${DEV_PASSWORD} (${persona.role}) — ${persona.name}`
    );
  }
  for (const token of SEED_API_TOKENS) {
    const value = `${API_TOKEN_PREFIX}${token.id}_${token.secret}`;
    console.info(
      `${token.owner} API token (${token.permissions.join("+")}): X-Api-Key: ${value}`
    );
  }
  console.info("seeded:", counts);

  await app.close();
}
