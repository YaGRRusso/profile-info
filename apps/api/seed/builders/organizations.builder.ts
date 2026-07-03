/** biome-ignore-all lint/style/noNestedTernary: test file */
import { faker } from "@faker-js/faker";
import { CatalogScope } from "@/core/enums/catalog-scope.enum";
import type { OrganizationModel } from "@/modules/organizations/schemas/organization.schema";
import {
  CATALOG_ORGANIZATION_COUNT,
  ORGANIZATION_CATEGORIES,
  SEED_LOCALES,
} from "../constants";
import { loremSentences, slugFor } from "../helpers/faker-seed.helper";
import { optionalForIndex, pickTextSize } from "../helpers/variation.helper";

export function buildCatalogOrganizations(): Pick<
  OrganizationModel,
  | "name"
  | "slug"
  | "category"
  | "website"
  | "logo"
  | "i18n"
  | "scope"
  | "disabled"
>[] {
  return Array.from({ length: CATALOG_ORGANIZATION_COUNT }, (_, index) => {
    const name =
      pickTextSize(index) === "large"
        ? `${faker.company.name()} ${faker.company.catchPhrase()}`
        : pickTextSize(index) === "small"
          ? (faker.company.name().split(" ")[0] ?? faker.company.name())
          : faker.company.name();

    return {
      scope: CatalogScope.GLOBAL,
      disabled: index % 19 === 0,
      name,
      slug: slugFor(name, index),
      category: faker.helpers.arrayElement(ORGANIZATION_CATEGORIES),
      website: optionalForIndex(index, () => faker.internet.url()),
      logo: optionalForIndex(index + 1, () =>
        faker.image.urlPicsumPhotos({ width: 96, height: 96 })
      ),
      i18n: SEED_LOCALES.map((locale) => ({
        locale,
        messages: { description: loremSentences(pickTextSize(index)) },
      })),
    };
  });
}
