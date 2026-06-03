import { faker } from "@faker-js/faker";
import { NestFactory } from "@nestjs/core";
import { getModelToken } from "@nestjs/mongoose";
import { hash } from "bcryptjs";
import type { Model } from "mongoose";
import { AppModule } from "./app.module";
import { CourseModel } from "./schemas/course.schema";
import { EducationModel } from "./schemas/education.schema";
import { ExperienceModel } from "./schemas/experience.schema";
import { OrganizationModel } from "./schemas/organization.schema";
import { ProjectModel } from "./schemas/project.schema";
import { SkillModel } from "./schemas/skill.schema";
import { UserModel } from "./schemas/user.schema";

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
  "react",
  "nodedotjs",
  "nextdotjs",
  "nestjs",
  "tailwindcss",
  "docker",
  "kubernetes",
  "amazonaws",
  "postgresql",
  "mongodb",
  "redis",
  "graphql",
  "vitest",
  "vite",
  "html5",
  "css3",
  "linux",
  "git",
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
const LOCALES = ["en", "pt"];

const relevance = () => faker.number.int({ min: 1, max: 5 });

const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const slugFor = (name: string, index: number) =>
  `${faker.helpers.slugify(name).toLowerCase()}-${index}`;

const i18n = () =>
  LOCALES.map((locale) => ({
    locale,
    messages: {
      title: faker.lorem.words({ min: 2, max: 4 }),
      description: faker.lorem.sentences({ min: 2, max: 5 }),
    },
  }));

const period = () => {
  const from = faker.date.past({ years: 8 });
  return { from, to: faker.date.between({ from, to: new Date() }) };
};

function buildMany<T>(count: number, build: (index: number) => T) {
  return Array.from({ length: count }, (_, index) => build(index));
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

  await Promise.all([
    skills.deleteMany({}),
    organizations.deleteMany({}),
    courses.deleteMany({}),
    educations.deleteMany({}),
    projects.deleteMany({}),
    experiences.deleteMany({}),
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
      };
    })
  );
  const organizationIds = organizationDocs.map((doc) => doc._id);

  const randomOrganization = () => faker.helpers.arrayElement(organizationIds);
  const randomSkills = () =>
    faker.helpers.arrayElements(skillIds, { min: 3, max: 9 });

  await courses.create(
    buildMany(8, (index) => ({
      slug: slugFor(faker.company.catchPhrase(), index),
      organization: randomOrganization(),
      status: faker.helpers.arrayElement(STATUSES),
      relevance: relevance(),
      hours: faker.number.int({ min: 8, max: 400 }),
      url: faker.internet.url(),
      image: faker.image.urlPicsumPhotos(),
      skills: randomSkills(),
      i18n: i18n(),
    }))
  );

  await educations.create(
    buildMany(4, (index) => ({
      slug: slugFor(faker.company.catchPhrase(), index),
      organization: randomOrganization(),
      level: faker.helpers.arrayElement(EDUCATION_LEVELS),
      status: faker.helpers.arrayElement(STATUSES),
      relevance: relevance(),
      skills: randomSkills(),
      period: period(),
      i18n: i18n(),
    }))
  );

  await projects.create(
    buildMany(8, (index) => ({
      slug: slugFor(faker.commerce.productName(), index),
      relevance: relevance(),
      images: faker.helpers.multiple(() => faker.image.url(), {
        count: { min: 1, max: 3 },
      }),
      skills: randomSkills(),
      urls: faker.helpers.arrayElements(URL_TYPES).map((type) => ({
        title: type,
        value: faker.internet.url(),
      })),
      i18n: i18n(),
    }))
  );

  await experiences.create(
    buildMany(6, (index) => ({
      slug: slugFor(faker.person.jobTitle(), index),
      organization: randomOrganization(),
      category: faker.helpers.arrayElement(EXPERIENCE_CATEGORIES),
      relevance: relevance(),
      roles: buildMany(faker.number.int({ min: 1, max: 3 }), () => ({
        period: period(),
        skills: randomSkills(),
        i18n: i18n(),
      })),
    }))
  );

  await users.create({
    name: "Admin",
    nickname: "admin",
    email: "admin@profile.info",
    password: await hash("admin123", 8),
    role: "ADMIN",
  });

  const counts = {
    skills: await skills.countDocuments(),
    organizations: await organizations.countDocuments(),
    courses: await courses.countDocuments(),
    educations: await educations.countDocuments(),
    projects: await projects.countDocuments(),
    experiences: await experiences.countDocuments(),
    users: await users.countDocuments(),
  };

  console.info("admin@profile.info / admin123");
  console.info("seeded:", counts);

  await app.close();
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
