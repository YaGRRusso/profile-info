import {
  toBaseEntityFields,
  toIdString,
  toIdStrings,
} from "@/core/mappers/base.mapper";
import { toTranslationEntityList } from "@/core/mappers/translation.mapper";
import { toUrlEntityList } from "@/core/mappers/url.mapper";
import type { ProjectEntity } from "../entities/project.entity";
import type { ProjectModel } from "../schemas/project.schema";

export function toProjectEntity(model: ProjectModel): ProjectEntity {
  return {
    ...toBaseEntityFields(model),
    relevance: model.relevance,
    slug: model.slug,
    ownerId: toIdString(model.ownerId) ?? "",
    images: model.images,
    skillIds: toIdStrings(model.skillIds),
    i18n:
      toTranslationEntityList(model.i18n)?.map((entry) => ({
        locale: entry.locale,
        messages: {
          title: entry.messages.title,
          description: entry.messages.description,
        },
      })) ?? [],
    urls: toUrlEntityList(model.urls),
  } as ProjectEntity;
}
