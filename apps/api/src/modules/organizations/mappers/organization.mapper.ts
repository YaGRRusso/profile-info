import { toBaseEntityFields } from "@/core/mappers/base.mapper";
import type { OrganizationEntity } from "../entities/organization.entity";
import type { OrganizationCategory } from "../enums/category.enum";
import type { OrganizationModel } from "../schemas/organization.schema";

export function toOrganizationEntity(
  model: OrganizationModel
): OrganizationEntity {
  return {
    ...toBaseEntityFields(model),
    relevance: model.relevance,
    slug: model.slug,
    name: model.name,
    website: model.website,
    logo: model.logo,
    i18n: model.i18n.map((entry) => ({
      locale: entry.locale,
      messages: { description: entry.messages.description },
    })),
    category: model.category as OrganizationCategory,
  };
}
