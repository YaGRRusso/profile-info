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
import { withObjectIdRefs } from "@/core/persistence/helpers/filter-ref.helper";
import { toPersistenceSort } from "@/core/persistence/helpers/sort-ref.helper";
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
  implements
    CrudMapperInterface<
      EducationEntityRecord,
      EducationModel,
      CreateEducationInput,
      UpdateEducationInput,
      FilterEducationInput,
      SortEducationInput
    >
{
  toDomain(model: EducationModel): EducationEntityRecord {
    return {
      ...toBaseEntityFields(model),
      i18n:
        toTranslationEntityList(model.i18n)?.map((entry) => ({
          locale: entry.locale,
          messages: {
            description: entry.messages.description,
            title: entry.messages.title,
          },
        })) ?? [],
      image: model.image,
      level: model.level as EducationLevel,
      organizationId: toIdString(model.organizationId),
      ownerId: toIdString(model.ownerId) ?? "",
      period: model.period ? toDateRangeEntity(model.period) : undefined,
      relevance: model.relevance,
      skillIds: toIdStrings(model.skillIds),
      slug: model.slug,
      status: model.status as EducationStatus,
      url: model.url,
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
    return withObjectIdRefs(entity, {
      array: ["skillIds"],
      single: ["organizationId"],
    });
  }

  toPersistenceForSort(
    entity: SortEducationInput
  ): Record<keyof EducationModel, SortOrder> {
    return toPersistenceSort<SortEducationInput, EducationModel>(entity);
  }
}
