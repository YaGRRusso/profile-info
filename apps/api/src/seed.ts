import { faker } from "@faker-js/faker";
import { NestFactory } from "@nestjs/core";
import { getModelToken } from "@nestjs/mongoose";
import { hash } from "bcryptjs";
import type { Model } from "mongoose";
import { AppModule } from "./app.module";
import { Locale } from "./common/i18n/locales";
import { ApiTokenPermission } from "./core/enums/api-token-permission.enum";
import { UserRole } from "./core/enums/user-role.enum";
import { API_TOKEN_PREFIX } from "./modules/api-tokens/constants/api-token.constants";
import { ApiTokenModel } from "./modules/api-tokens/schemas/api-token.schema";
import { CourseModel } from "./modules/courses/schemas/course.schema";
import { EducationModel } from "./modules/educations/schemas/education.schema";
import { ExperienceModel } from "./modules/experiences/schemas/experience.schema";
import { OrganizationModel } from "./modules/organizations/schemas/organization.schema";
import { ProjectModel } from "./modules/projects/schemas/project.schema";
import { SkillModel } from "./modules/skills/schemas/skill.schema";
import { UserModel } from "./modules/users/schemas/user.schema";

const URL_TYPES = [
  "github",
  "linkedin",
  "whatsapp",
  "email",
  "phone",
  "other",
  "website",
  "repository",
  "demo",
];

const SKILLS_SLUGS = [
  "javascript",
  "typescript",
  "nodedotjs",
  "bun",
  "deno",
  "react",
  "nextdotjs",
  "remix",
  "astro",
  "vuedotjs",
  "angular",
  "svelte",
  "solid",
  "nestjs",
  "express",
  "fastify",
  "hono",
  "trpc",
  "graphql",
  "apollographql",
  "tailwindcss",
  "sass",
  "styledcomponents",
  "css",
  "html5",
  "vite",
  "webpack",
  "esbuild",
  "turborepo",
  "eslint",
  "prettier",
  "biome",
  "vitest",
  "jest",
  "cypress",
  "testinglibrary",
  "prisma",
  "drizzle",
  "typeorm",
  "mongoose",
  "postgresql",
  "mongodb",
  "redis",
  "supabase",
  "docker",
  "kubernetes",
  "terraform",
  "nginx",
  "githubactions",
  "npm",
  "pnpm",
  "yarn",
  "git",
  "github",
  "redux",
  "tanstack",
  "reactquery",
  "reactrouter",
  "zod",
  "radixui",
  "shadcnui",
  "mui",
  "expo",
  "electron",
  "storybook",
  "socketdotio",
  "axios",
  "lodash",
  "mdx",
  "linux",
];

const SKILL_CATEGORIES = ["LANGUAGE", "FRONTEND", "BACKEND", "DATA", "DEVOPS"];
const ORGANIZATION_CATEGORIES = ["COMPANY", "SCHOOL", "OTHER"];
const STATUSES = ["COMPLETE", "INCOMPLETE", "IN_PROGRESS"];
const EDUCATION_LEVELS = [
  "HIGH_SCHOOL",
  "TECHNICAL",
  "BACHELOR",
  "POSTGRAD",
  "MASTER",
  "DOCTORATE",
];
const EXPERIENCE_CATEGORIES = [
  "FULL_TIME",
  "PART_TIME",
  "FREELANCE",
  "VOLUNTEER",
];
const SEED_LOCALES = [Locale.EN, Locale.PT];

const SEED_API_TOKENS = [
  {
    id: "674a00000000000000000001",
    owner: "alice" as const,
    name: "Alice dev (query)",
    permissions: [ApiTokenPermission.QUERY],
    secret: "alice-query-dev-secret-32-chars!!",
  },
  {
    id: "674a00000000000000000002",
    owner: "alice" as const,
    name: "Alice dev (mutate)",
    permissions: [ApiTokenPermission.MUTATE],
    secret: "alice-mutate-dev-secret-32-chars!!",
  },
  {
    id: "674a00000000000000000003",
    owner: "bob" as const,
    name: "Bob dev (query + mutate)",
    permissions: [ApiTokenPermission.QUERY, ApiTokenPermission.MUTATE],
    secret: "bob-combined-dev-secret-32-chars!!",
  },
] as const;

const relevance = () => faker.number.int({ min: 1, max: 5 });

const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const slugFor = (name: string, index: number) =>
  `${faker.helpers.slugify(name).toLowerCase()}-${index}`;

const i18n = (messages: Record<string, string>) =>
  SEED_LOCALES.map((locale) => ({
    locale,
    messages,
  }));

const period = () => {
  const from = faker.date.past({ years: 8 });
  return { from, to: faker.date.between({ from, to: new Date() }) };
};

function buildMany<T>(count: number, build: (index: number) => T) {
  return Array.from({ length: count }, (_, index) => build(index));
}

async function buildSeedUser(
  users: Model<UserModel>,
  data: {
    name: string;
    nickname: string;
    email: string;
    password: string;
    role: UserRole;
  }
) {
  return users.create({
    name: data.name,
    nickname: data.nickname,
    email: data.email,
    password: await hash(data.password, 8),
    role: data.role,
    address: faker.location.streetAddress(),
    avatar: faker.image.urlPicsumPhotos(),
    birth: faker.date.past({ years: 30 }),
    phone: faker.phone.number(),
    i18n: [
      {
        locale: "en",
        messages: {
          title: faker.person.jobTitle(),
          description: faker.lorem.paragraphs({ min: 1, max: 2 }),
        },
      },
      {
        locale: "pt",
        messages: {
          title: faker.person.jobTitle(),
          description: faker.lorem.paragraphs({ min: 1, max: 2 }),
        },
      },
    ],
    urls: faker.helpers.arrayElements(URL_TYPES).map((type) => ({
      title: type,
      value: faker.internet.url(),
    })),
  });
}

async function seed() {
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

  const skillDocs = await skills.create(
    SKILLS_SLUGS.map((slug) => {
      const name = capitalize(slug);
      return {
        name,
        slug,
        category: faker.helpers.arrayElement(SKILL_CATEGORIES),
        relevance: relevance(),
      };
    })
  );
  const skillIds = skillDocs.map((doc) => doc._id);

  const organizationDocs = await organizations.create(
    buildMany(6, (index) => {
      const name = faker.company.name();
      return {
        name,
        slug: slugFor(name, index),
        category: faker.helpers.arrayElement(ORGANIZATION_CATEGORIES),
        logo: faker.image.urlPicsumPhotos({ width: 96, height: 96 }),
        website: faker.internet.url(),
        relevance: relevance(),
        i18n: i18n({
          description: faker.lorem.sentences({ min: 8, max: 32 }),
        }),
      };
    })
  );
  const organizationIds = organizationDocs.map((doc) => doc._id);

  const randomOrganization = () => faker.helpers.arrayElement(organizationIds);
  const randomSkills = () =>
    faker.helpers.arrayElements(skillIds, { min: 3, max: 9 });

  const [userAlice, userBob] = await Promise.all([
    buildSeedUser(users, {
      name: "Alice",
      nickname: "alice",
      email: "alice@profile.info",
      password: "alice.pass",
      role: UserRole.USER,
    }),
    buildSeedUser(users, {
      name: "Bob",
      nickname: "bob",
      email: "bob@profile.info",
      password: "bob.pass",
      role: UserRole.USER,
    }),
    buildSeedUser(users, {
      name: "Admin",
      nickname: "admin",
      email: "admin@profile.info",
      password: "admin.pass",
      role: UserRole.SUPER_ADMIN,
    }),
  ]);

  const ownerForIndex = (index: number) =>
    index % 2 === 0 ? userAlice._id : userBob._id;

  await courses.create(
    buildMany(8, (index) => ({
      ownerId: ownerForIndex(index),
      slug: slugFor(faker.company.catchPhrase(), index),
      organizationId: randomOrganization(),
      status: faker.helpers.arrayElement(STATUSES),
      relevance: relevance(),
      hours: faker.number.int({ min: 8, max: 400 }),
      url: faker.internet.url(),
      image: faker.image.urlPicsumPhotos(),
      skillIds: randomSkills(),
      i18n: i18n({
        title: faker.lorem.words({ min: 8, max: 16 }),
        description: faker.lorem.sentences({ min: 8, max: 64 }),
      }),
    }))
  );

  await educations.create(
    buildMany(4, (index) => ({
      ownerId: ownerForIndex(index),
      slug: slugFor(faker.company.catchPhrase(), index),
      organizationId: randomOrganization(),
      level: faker.helpers.arrayElement(EDUCATION_LEVELS),
      status: faker.helpers.arrayElement(STATUSES),
      relevance: relevance(),
      skillIds: randomSkills(),
      period: period(),
      i18n: i18n({
        title: faker.lorem.words({ min: 8, max: 16 }),
        description: faker.lorem.sentences({ min: 8, max: 64 }),
      }),
    }))
  );

  await projects.create(
    buildMany(8, (index) => ({
      ownerId: ownerForIndex(index),
      slug: slugFor(faker.commerce.productName(), index),
      relevance: relevance(),
      images: faker.helpers.multiple(() => faker.image.url(), {
        count: { min: 1, max: 3 },
      }),
      skillIds: randomSkills(),
      urls: faker.helpers.arrayElements(URL_TYPES).map((type) => ({
        title: type,
        value: faker.internet.url(),
      })),
      i18n: i18n({
        title: faker.lorem.words({ min: 8, max: 16 }),
        description: faker.lorem.sentences({ min: 8, max: 64 }),
      }),
    }))
  );

  await experiences.create(
    buildMany(6, (index) => ({
      ownerId: ownerForIndex(index),
      slug: slugFor(faker.person.jobTitle(), index),
      organizationId: randomOrganization(),
      category: faker.helpers.arrayElement(EXPERIENCE_CATEGORIES),
      relevance: relevance(),
      roles: buildMany(faker.number.int({ min: 1, max: 3 }), () => ({
        period: period(),
        skillIds: randomSkills(),
        i18n: i18n({
          title: faker.lorem.words({ min: 8, max: 16 }),
          description: faker.lorem.sentences({ min: 8, max: 64 }),
        }),
      })),
    }))
  );

  const ownersByKey = {
    alice: userAlice._id,
    bob: userBob._id,
  } as const;

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

  console.info("alice@profile.info / alice.pass (USER)");
  console.info("bob@profile.info / bob.pass (USER)");
  console.info("admin@profile.info / pass.123 (SUPER_ADMIN)");
  for (const token of SEED_API_TOKENS) {
    const value = `${API_TOKEN_PREFIX}${token.id}_${token.secret}`;
    console.info(
      `${token.owner} API token (${token.permissions.join("+")}): X-Api-Key: ${value}`
    );
  }
  console.info("seeded:", counts);

  await app.close();
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
