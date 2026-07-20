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
      hours: optionalForIndex(globalIndex + 1, () =>
        faker.number.int({ max: 400, min: 8 })
      ),
      i18n: bilingualTitleDescription(globalIndex),
      image: optionalForIndex(globalIndex + 3, () =>
        faker.image.urlPicsumPhotos()
      ),
      organizationId: optionalForIndex(globalIndex, () =>
        faker.helpers.arrayElement(organizationIds)
      ),
      ownerId,
      relevance: relevance(),
      skillIds: pickSkillIds(skillIds, globalIndex),
      slug: slugFor(faker.company.catchPhrase(), globalIndex),
      status: faker.helpers.arrayElement(STATUSES),
      url: optionalForIndex(globalIndex + 2, () => faker.internet.url()),
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
      i18n: bilingualTitleDescription(globalIndex),
      image: optionalForIndex(globalIndex + 3, () =>
        faker.image.urlPicsumPhotos()
      ),
      level: faker.helpers.arrayElement(EDUCATION_LEVELS),
      organizationId: optionalForIndex(globalIndex, () =>
        faker.helpers.arrayElement(organizationIds)
      ),
      ownerId,
      period: optionalForIndex(globalIndex + 1, period),
      relevance: relevance(),
      skillIds: pickSkillIds(skillIds, globalIndex),
      slug: slugFor(faker.company.catchPhrase(), globalIndex),
      status: faker.helpers.arrayElement(STATUSES),
      url: optionalForIndex(globalIndex + 2, () => faker.internet.url()),
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
      i18n: bilingualTitleDescription(globalIndex),
      images: arrayBySize(pickArraySize(globalIndex), () => faker.image.url()),
      ownerId,
      relevance: relevance(),
      skillIds: pickSkillIds(skillIds, globalIndex),
      slug: slugFor(faker.commerce.productName(), globalIndex),
      urls: optionalForIndex(globalIndex, () =>
        arrayBySize(pickArraySize(globalIndex + 1), () => ({
          title: faker.helpers.arrayElement(URL_TYPES),
          value: faker.internet.url(),
        }))
      ),
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

    return {
      category: faker.helpers.arrayElement(EXPERIENCE_CATEGORIES),
      i18n: bilingualTitleDescription(globalIndex),
      organizationId: optionalForIndex(globalIndex, () =>
        faker.helpers.arrayElement(organizationIds)
      ),
      ownerId,
      period: optionalForIndex(globalIndex, period),
      relevance: relevance(),
      skillIds: pickSkillIds(skillIds, globalIndex),
      slug: slugFor(faker.person.jobTitle(), globalIndex),
    } satisfies Partial<ExperienceModel>;
  });
}
