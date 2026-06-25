import {
  toBaseEntityFields,
  toIdString,
  toIdStrings,
} from "@/core/mappers/base.mapper";
import { toTranslationEntityList } from "@/core/mappers/translation.mapper";
import type { CourseEntity } from "../entities/course.entity";
import type { CourseStatus } from "../enums/status.enum";
import type { CourseModel } from "../schemas/course.schema";

export function toCourseEntity(model: CourseModel): CourseEntity {
  return {
    ...toBaseEntityFields(model),
    relevance: model.relevance,
    slug: model.slug,
    ownerId: toIdString(model.ownerId) ?? "",
    organizationId: toIdString(model.organizationId) ?? "",
    status: model.status as CourseStatus,
    url: model.url,
    image: model.image,
    hours: model.hours,
    i18n:
      toTranslationEntityList(model.i18n)?.map((entry) => ({
        locale: entry.locale,
        messages: {
          title: entry.messages.title,
          description: entry.messages.description,
        },
      })) ?? [],
    skillIds: toIdStrings(model.skillIds),
  } as CourseEntity;
}
