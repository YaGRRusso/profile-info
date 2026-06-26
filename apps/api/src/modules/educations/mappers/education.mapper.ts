import {
  type AnyKeys,
  type QueryFilter,
  type SortOrder,
  type UpdateQuery,
} from "mongoose";
import {
  toBaseEntityFields,
  toIdString,
  toIdStrings,
  toObjectId,
  toObjectIds,
} from "@/core/mappers/base.mapper";
import { toDateRangeEntity } from "@/core/mappers/date-range.mapper";
import { toTranslationEntityList } from "@/core/mappers/translation.mapper";
import type { CrudMapperInterface } from "@/core/persistence/repositories/crud/crud.interface";
import { CreateEducationInput } from "../dto/create-education.input";
import { FilterEducationInput } from "../dto/filter-education.input";
import { SortEducationInput } from "../dto/sort-education.input";
import { UpdateEducationInput } from "../dto/update-education.input";
import type { EducationEntityRecord } from "../entities/education.entity";
import type { EducationLevel } from "../enums/level.enum";
import type { EducationStatus } from "../enums/status.enum";
import type { EducationModel } from "../schemas/education.schema";

export class EducationMapper
  implements CrudMapperInterface<EducationEntityRecord, EducationModel>
{
  toDomain(model: EducationModel): EducationEntityRecord {
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
    };
  }

  toPersistenceForCreate(
    entity: CreateEducationInput
  ): AnyKeys<EducationModel> {
    return {
      ...entity,
      organizationId: toObjectId(entity.organizationId),
      skillIds: toObjectIds(entity.skillIds),
    };
  }

  toPersistenceForUpdate(
    entity: UpdateEducationInput
  ): UpdateQuery<EducationModel> {
    return {
      ...entity,
      organizationId: entity.organizationId
        ? toObjectId(entity.organizationId)
        : undefined,
      skillIds: toObjectIds(entity.skillIds),
    };
  }

  toPersistenceForFilter(
    entity: FilterEducationInput
  ): QueryFilter<EducationModel> {
    return { ...entity } as QueryFilter<EducationModel>;
  }

  toPersistenceForSort(
    entity: SortEducationInput
  ): Record<keyof EducationModel, SortOrder> {
    return { ...entity } as Record<keyof EducationModel, SortOrder>;
  }
}
