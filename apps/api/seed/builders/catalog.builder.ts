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

export function buildCatalogSkills(): Pick<
  SkillModel,
  "slug" | "category" | "i18n" | "partition" | "disabled"
>[] {
  return Array.from({ length: CATALOG_SKILL_COUNT }, (_, index) => {
    const title = skillTitle(index);
    const slug = slugFor(title, index);
    const category =
      index % 4 === 0 ? undefined : CATEGORY_POOL[index % CATEGORY_POOL.length];

    return {
      partition: CatalogPartition.GLOBAL,
      disabled: index % 17 === 0,
      slug,
      category,
      i18n: SEED_LOCALES.map((locale) => ({
        locale,
        messages: { title },
      })),
    };
  });
}

export function pickProfileSkillIds(
  allSkillIds: string[],
  count: number
): string[] {
  if (count <= 0) return [];

  const uncategorized = allSkillIds.filter((_, index) => index % 4 === 0);
  const categorized = allSkillIds.filter((_, index) => index % 4 !== 0);
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
