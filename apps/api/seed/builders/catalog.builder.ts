import { faker } from "@faker-js/faker";
import { CatalogPartition } from "@/core/enums/catalog-partition.enum";
import type { SkillModel } from "@/modules/skills/schemas/skill.schema";
import { CATALOG_SKILL_COUNT, SEED_LOCALES } from "../constants";
import { slugFor } from "../helpers/faker-seed.helper";
import { optionalForIndex, pickTextSize } from "../helpers/variation.helper";

const CATEGORY_POOL = buildCategoryPool();

function buildCategoryPool(): string[] {
  return Array.from({ length: 18 }, () =>
    faker.commerce.department().replace(/\s+/g, " ").trim()
  );
}

function skillTitle(index: number): string {
  const size = pickTextSize(index);

  if (size === "small") return faker.person.jobType();
  if (size === "medium") {
    return `${faker.person.jobArea()} ${faker.hacker.noun()}`;
  }
  return `${faker.person.jobArea()} ${faker.lorem.words({ min: 4, max: 8 })}`;
}

type SkillSeed = Pick<
  SkillModel,
  "slug" | "category" | "i18n" | "partition" | "disabled" | "ownerId"
>;

function buildSkills(
  ownerId: string,
  count: number,
  partition: CatalogPartition,
  seedOffset: number
): SkillSeed[] {
  return Array.from({ length: count }, (_, index) => {
    const globalIndex = seedOffset + index;
    const title = skillTitle(globalIndex);
    const slug = slugFor(title, globalIndex);
    const category =
      globalIndex % 4 === 0
        ? undefined
        : CATEGORY_POOL[globalIndex % CATEGORY_POOL.length];

    return {
      partition,
      ownerId,
      disabled: globalIndex % 17 === 0,
      slug,
      category,
      i18n: SEED_LOCALES.map((locale) => ({
        locale,
        messages: { title },
      })),
    };
  });
}

export function buildCatalogSkills(ownerId: string): SkillSeed[] {
  return buildSkills(ownerId, CATALOG_SKILL_COUNT, CatalogPartition.GLOBAL, 0);
}

export function buildLocalSkillsForPersona(
  ownerId: string,
  count: number,
  seedOffset: number
): SkillSeed[] {
  if (count <= 0) return [];

  return buildSkills(ownerId, count, CatalogPartition.LOCAL, seedOffset).map(
    (skill, index) => (index === 0 ? { ...skill, disabled: true } : skill)
  );
}

export function pickProfileSkillIds(
  allSkillIds: string[],
  count: number
): string[] {
  if (count <= 0) return [];

  const eligible = allSkillIds
    .map((id, index) => ({ id, index }))
    .filter(({ index }) => index % 17 !== 0);
  const uncategorized = eligible
    .filter(({ index }) => index % 4 === 0)
    .map(({ id }) => id);
  const categorized = eligible
    .filter(({ index }) => index % 4 !== 0)
    .map(({ id }) => id);
  const picked = [
    ...uncategorized.slice(0, Math.ceil(count / 3)),
    ...categorized.slice(0, count),
  ];

  return [...new Set(picked)].slice(0, count);
}

export function pickSkillIds(
  allSkillIds: string[],
  index: number
): string[] | undefined {
  return optionalForIndex(index, () =>
    faker.helpers
      .arrayElements(allSkillIds, {
        min: Math.min(3, allSkillIds.length),
        max: Math.min(9, allSkillIds.length),
      })
      .map(String)
  );
}
