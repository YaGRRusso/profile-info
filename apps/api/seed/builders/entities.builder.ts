import { faker } from "@faker-js/faker";
import type { CourseModel } from "@/modules/courses/schemas/course.schema";
import type { EducationModel } from "@/modules/educations/schemas/education.schema";
import type { ExperienceModel } from "@/modules/experiences/schemas/experience.schema";
import type { ProjectModel } from "@/modules/projects/schemas/project.schema";
import {
  EDUCATION_LEVELS,
  EXPERIENCE_CATEGORIES,
  STATUSES,
  URL_TYPES,
} from "../constants";
import {
  bilingualTitleDescription,
  buildMany,
  period,
  relevance,
  slugFor,
} from "../helpers/faker-seed.helper";
import {
  arrayBySize,
  optionalForIndex,
  pickArraySize,
} from "../helpers/variation.helper";
import type { PersonaEntityCounts } from "../personas";
import { pickSkillIds } from "./catalog.builder";

type ObjectId = string;

export function buildCoursesForPersona(
  ownerId: ObjectId,
  counts: PersonaEntityCounts,
  organizationIds: ObjectId[],
  skillIds: ObjectId[],
  seedOffset: number
) {
  return buildMany(counts.courses, (index) => {
    const globalIndex = seedOffset + index;

    return {
      ownerId,
      slug: slugFor(faker.company.catchPhrase(), globalIndex),
      organizationId: optionalForIndex(globalIndex, () =>
        faker.helpers.arrayElement(organizationIds)
      ),
      status: faker.helpers.arrayElement(STATUSES),
      relevance: relevance(),
      hours: optionalForIndex(globalIndex + 1, () =>
        faker.number.int({ min: 8, max: 400 })
      ),
      url: optionalForIndex(globalIndex + 2, () => faker.internet.url()),
      image: optionalForIndex(globalIndex + 3, () =>
        faker.image.urlPicsumPhotos()
      ),
      skillIds: pickSkillIds(skillIds, globalIndex),
      i18n: bilingualTitleDescription(globalIndex),
    } satisfies Partial<CourseModel>;
  });
}

export function buildEducationsForPersona(
  ownerId: ObjectId,
  counts: PersonaEntityCounts,
  organizationIds: ObjectId[],
  skillIds: ObjectId[],
  seedOffset: number
) {
  return buildMany(counts.educations, (index) => {
    const globalIndex = seedOffset + index;

    return {
      ownerId,
      slug: slugFor(faker.company.catchPhrase(), globalIndex),
      organizationId: optionalForIndex(globalIndex, () =>
        faker.helpers.arrayElement(organizationIds)
      ),
      level: faker.helpers.arrayElement(EDUCATION_LEVELS),
      status: faker.helpers.arrayElement(STATUSES),
      relevance: relevance(),
      skillIds: pickSkillIds(skillIds, globalIndex),
      period: optionalForIndex(globalIndex + 1, period),
      url: optionalForIndex(globalIndex + 2, () => faker.internet.url()),
      image: optionalForIndex(globalIndex + 3, () =>
        faker.image.urlPicsumPhotos()
      ),
      i18n: bilingualTitleDescription(globalIndex),
    } satisfies Partial<EducationModel>;
  });
}

export function buildProjectsForPersona(
  ownerId: ObjectId,
  counts: PersonaEntityCounts,
  skillIds: ObjectId[],
  seedOffset: number
) {
  return buildMany(counts.projects, (index) => {
    const globalIndex = seedOffset + index;

    return {
      ownerId,
      slug: slugFor(faker.commerce.productName(), globalIndex),
      relevance: relevance(),
      images: arrayBySize(pickArraySize(globalIndex), () => faker.image.url()),
      skillIds: pickSkillIds(skillIds, globalIndex),
      urls: optionalForIndex(globalIndex, () =>
        arrayBySize(pickArraySize(globalIndex + 1), () => ({
          title: faker.helpers.arrayElement(URL_TYPES),
          value: faker.internet.url(),
        }))
      ),
      i18n: bilingualTitleDescription(globalIndex),
    } satisfies Partial<ProjectModel>;
  });
}

export function buildExperiencesForPersona(
  ownerId: ObjectId,
  counts: PersonaEntityCounts,
  organizationIds: ObjectId[],
  skillIds: ObjectId[],
  seedOffset: number
) {
  return buildMany(counts.experiences, (index) => {
    const globalIndex = seedOffset + index;
    const roleCount = faker.number.int({ min: 1, max: 4 });

    return {
      ownerId,
      slug: slugFor(faker.person.jobTitle(), globalIndex),
      organizationId: optionalForIndex(globalIndex, () =>
        faker.helpers.arrayElement(organizationIds)
      ),
      category: faker.helpers.arrayElement(EXPERIENCE_CATEGORIES),
      relevance: relevance(),
      roles: buildMany(roleCount, (roleIndex) => ({
        period: optionalForIndex(globalIndex + roleIndex, period),
        skillIds: pickSkillIds(skillIds, globalIndex + roleIndex),
        i18n: bilingualTitleDescription(globalIndex + roleIndex),
      })),
    } satisfies Partial<ExperienceModel>;
  });
}
