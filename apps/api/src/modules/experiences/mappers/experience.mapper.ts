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
import { CreateExperienceInput } from "../dto/create-experience.input";
import { FilterExperienceInput } from "../dto/filter-experience.input";
import { SortExperienceInput } from "../dto/sort-experience.input";
import { UpdateExperienceInput } from "../dto/update-experience.input";
import type { ExperienceEntityRecord } from "../entities/experience.entity";
import type { ExperienceCategory } from "../enums/category.enum";
import type { ExperienceModel } from "../schemas/experience.schema";

export class ExperienceMapper
  implements
    CrudMapperInterface<
      ExperienceEntityRecord,
      ExperienceModel,
      CreateExperienceInput,
      UpdateExperienceInput,
      FilterExperienceInput,
      SortExperienceInput
    >
{
  toDomain(model: ExperienceModel): ExperienceEntityRecord {
    return {
      ...toBaseEntityFields(model),
      category: model.category as ExperienceCategory,
      i18n:
        toTranslationEntityList(model.i18n)?.map((entry) => ({
          locale: entry.locale,
          messages: {
            description: entry.messages.description,
            title: entry.messages.title,
          },
        })) ?? [],
      organizationId: toIdString(model.organizationId),
      ownerId: toIdString(model.ownerId) ?? "",
      period: model.period ? toDateRangeEntity(model.period) : undefined,
      relevance: model.relevance,
      skillIds: toIdStrings(model.skillIds),
      slug: model.slug,
    };
  }

  toPersistenceForCreate(
    entity: CreateExperienceInput
  ): AnyKeys<ExperienceModel> {
    return {
      ...entity,
      organizationId: toObjectId(entity.organizationId),
      skillIds: toObjectIds(entity.skillIds),
    };
  }

  toPersistenceForUpdate(
    entity: UpdateExperienceInput
  ): UpdateQuery<ExperienceModel> {
    return {
      ...entity,
      organizationId: entity.organizationId
        ? toObjectId(entity.organizationId)
        : undefined,
      skillIds: toObjectIds(entity.skillIds),
    };
  }

  toPersistenceForFilter(
    entity: FilterExperienceInput
  ): QueryFilter<ExperienceModel> {
    return withObjectIdRefs(entity, {
      array: ["skillIds"],
      single: ["organizationId"],
    });
  }

  toPersistenceForSort(
    entity: SortExperienceInput
  ): Record<keyof ExperienceModel, SortOrder> {
    return toPersistenceSort<SortExperienceInput, ExperienceModel>(entity);
  }
}
