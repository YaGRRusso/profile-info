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
  buildLocalSkillsForPersona,
  pickProfileSkillIds,
} from "./builders/catalog.builder";
import {
  buildCoursesForPersona,
  buildEducationsForPersona,
  buildExperiencesForPersona,
  buildProjectsForPersona,
} from "./builders/entities.builder";
import {
  buildCatalogOrganizations,
  buildLocalOrganizationsForPersona,
} from "./builders/organizations.builder";
import { createPersonaUser } from "./builders/users.builder";
import {
  DEV_PASSWORD,
  FAKER_SEED,
  PERSONA_CATALOG_SEED_OFFSETS,
  SEED_API_TOKENS,
} from "./constants";
import { initSeedFakers } from "./helpers/faker-seed.helper";
import { PERSONA_KEYS, PERSONAS, type PersonaKey } from "./personas";

export async function runSeed(): Promise<void> {
  initSeedFakers();

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

  const adminPersona = PERSONAS.admin;
  const adminUser = await createPersonaUser(users, adminPersona, []);
  const globalOwnerId = String(adminUser._id);

  const globalSkillDocs = await skills.create(
    buildCatalogSkills(globalOwnerId)
  );
  const globalSkillIds = globalSkillDocs.map((doc) => String(doc._id));

  const globalOrganizationDocs = await organizations.create(
    buildCatalogOrganizations(globalOwnerId)
  );
  const globalOrganizationIds = globalOrganizationDocs.map((doc) =>
    String(doc._id)
  );

  const userDocs = {} as Record<
    PersonaKey,
    Awaited<ReturnType<typeof createPersonaUser>>
  >;
  userDocs.admin = adminUser;

  const skillIdsByPersona: Record<PersonaKey, string[]> = {
    admin: [...globalSkillIds],
    empty: [...globalSkillIds],
    lite: [...globalSkillIds],
    joao: [...globalSkillIds],
    maria: [...globalSkillIds],
    full: [...globalSkillIds],
  };

  const organizationIdsByPersona: Record<PersonaKey, string[]> = {
    admin: [...globalOrganizationIds],
    empty: [...globalOrganizationIds],
    lite: [...globalOrganizationIds],
    joao: [...globalOrganizationIds],
    maria: [...globalOrganizationIds],
    full: [...globalOrganizationIds],
  };

  for (const key of PERSONA_KEYS) {
    if (key === "admin") continue;

    const persona = PERSONAS[key];
    const profileSkillIds = pickProfileSkillIds(
      globalSkillIds,
      persona.profileSkillCount
    );

    userDocs[key] = await createPersonaUser(users, persona, profileSkillIds);

    const ownerId = String(userDocs[key]._id);
    const catalogSeedOffset = PERSONA_CATALOG_SEED_OFFSETS[key];

    if (persona.localCatalog.skills > 0) {
      const localSkillDocs = await skills.create(
        buildLocalSkillsForPersona(
          ownerId,
          persona.localCatalog.skills,
          catalogSeedOffset
        )
      );
      skillIdsByPersona[key].push(
        ...localSkillDocs.map((doc) => String(doc._id))
      );
    }

    if (persona.localCatalog.organizations > 0) {
      const localOrganizationDocs = await organizations.create(
        buildLocalOrganizationsForPersona(
          ownerId,
          persona.localCatalog.organizations,
          catalogSeedOffset
        )
      );
      organizationIdsByPersona[key].push(
        ...localOrganizationDocs.map((doc) => String(doc._id))
      );
    }
  }

  let entityOffset = 0;

  for (const key of PERSONA_KEYS) {
    const persona = PERSONAS[key];
    const ownerId = String(userDocs[key]._id);
    const skillIds = skillIdsByPersona[key];
    const organizationIds = organizationIdsByPersona[key];

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
