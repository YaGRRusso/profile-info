import {
  toBaseEntityFields,
  toIdString,
  toIdStrings,
} from "@/core/mappers/base.mapper";
import { toDateRangeEntity } from "@/core/mappers/date-range.mapper";
import { toTranslationEntityList } from "@/core/mappers/translation.mapper";
import type {
  ExperienceEntity,
  ExperienceRole,
} from "../entities/experience.entity";
import type { ExperienceCategory } from "../enums/category.enum";
import type {
  ExperienceModel,
  ExperienceRoleModel,
} from "../schemas/experience.schema";

function toExperienceRoleEntity(model: ExperienceRoleModel): ExperienceRole {
  return {
    i18n:
      toTranslationEntityList(model.i18n)?.map((entry) => ({
        locale: entry.locale,
        messages: {
          title: entry.messages.title,
          description: entry.messages.description,
        },
      })) ?? [],
    period: model.period ? toDateRangeEntity(model.period) : undefined,
    skillIds: toIdStrings(model.skillIds),
  };
}

export function toExperienceEntity(model: ExperienceModel): ExperienceEntity {
  return {
    ...toBaseEntityFields(model),
    relevance: model.relevance,
    slug: model.slug,
    ownerId: toIdString(model.ownerId) ?? "",
    organizationId: toIdString(model.organizationId) ?? "",
    category: model.category as ExperienceCategory,
    roles: model.roles.map(toExperienceRoleEntity),
  } as ExperienceEntity;
}
