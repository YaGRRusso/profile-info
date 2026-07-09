/** biome-ignore-all lint/style/noNestedTernary: test file */
import { faker } from "@faker-js/faker";
import { CatalogPartition } from "@/core/enums/catalog-partition.enum";
import type { OrganizationModel } from "@/modules/organizations/schemas/organization.schema";
import {
  CATALOG_ORGANIZATION_COUNT,
  ORGANIZATION_CATEGORIES,
  SEED_LOCALES,
} from "../constants";
import { loremSentences, slugFor } from "../helpers/faker-seed.helper";
import { optionalForIndex, pickTextSize } from "../helpers/variation.helper";

type OrganizationSeed = Pick<
  OrganizationModel,
  | "name"
  | "slug"
  | "category"
  | "website"
  | "logo"
  | "i18n"
  | "partition"
  | "disabled"
  | "ownerId"
>;

function organizationName(index: number): string {
  const size = pickTextSize(index);

  if (size === "large") {
    return `${faker.company.name()} ${faker.company.catchPhrase()}`;
  }
  if (size === "small") {
    return faker.company.name().split(" ")[0] ?? faker.company.name();
  }
  return faker.company.name();
}

function buildOrganizations(
  ownerId: string,
  count: number,
  partition: CatalogPartition,
  seedOffset: number
): OrganizationSeed[] {
  return Array.from({ length: count }, (_, index) => {
    const globalIndex = seedOffset + index;
    const name = organizationName(globalIndex);

    return {
      partition,
      ownerId,
      disabled: globalIndex % 19 === 0,
      name,
      slug: slugFor(name, globalIndex),
      category: faker.helpers.arrayElement(ORGANIZATION_CATEGORIES),
      website: optionalForIndex(globalIndex, () => faker.internet.url()),
      logo: optionalForIndex(globalIndex + 1, () =>
        faker.image.urlPicsumPhotos({ width: 96, height: 96 })
      ),
      i18n: SEED_LOCALES.map((locale) => ({
        locale,
        messages: {
          description: loremSentences(pickTextSize(globalIndex), locale),
        },
      })),
    };
  });
}

export function buildCatalogOrganizations(ownerId: string): OrganizationSeed[] {
  return buildOrganizations(
    ownerId,
    CATALOG_ORGANIZATION_COUNT,
    CatalogPartition.GLOBAL,
    0
  );
}

export function buildLocalOrganizationsForPersona(
  ownerId: string,
  count: number,
  seedOffset: number
): OrganizationSeed[] {
  if (count <= 0) return [];

  return buildOrganizations(
    ownerId,
    count,
    CatalogPartition.LOCAL,
    seedOffset
  ).map((organization, index) =>
    index === 0 ? { ...organization, disabled: true } : organization
  );
}
