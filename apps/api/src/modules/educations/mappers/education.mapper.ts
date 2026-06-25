import {
  toBaseEntityFields,
  toIdString,
  toIdStrings,
} from "@/core/mappers/base.mapper";
import { toDateRangeEntity } from "@/core/mappers/date-range.mapper";
import { toTranslationEntityList } from "@/core/mappers/translation.mapper";
import type { EducationEntity } from "../entities/education.entity";
import type { EducationLevel } from "../enums/level.enum";
import type { EducationStatus } from "../enums/status.enum";
import type { EducationModel } from "../schemas/education.schema";

export function toEducationEntity(model: EducationModel): EducationEntity {
  return {
    ...toBaseEntityFields(model),
    relevance: model.relevance,
    slug: model.slug,
    ownerId: toIdString(model.ownerId) ?? "",
    organizationId: toIdString(model.organizationId) ?? "",
    level: model.level as EducationLevel,
    status: model.status as EducationStatus,
    url: model.url,
    image: model.image,
    i18n:
      toTranslationEntityList(model.i18n)?.map((entry) => ({
        locale: entry.locale,
        messages: {
          title: entry.messages.title,
          description: entry.messages.description,
        },
      })) ?? [],
    skillIds: toIdStrings(model.skillIds),
    period: model.period ? toDateRangeEntity(model.period) : undefined,
  } as EducationEntity;
}
