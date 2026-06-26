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
import { CreateExperienceInput } from "../dto/create-experience.input";
import { FilterExperienceInput } from "../dto/filter-experience.input";
import { SortExperienceInput } from "../dto/sort-experience.input";
import { UpdateExperienceInput } from "../dto/update-experience.input";
import type {
  ExperienceEntityRecord,
  ExperienceRoleRecord,
} from "../entities/experience.entity";
import type { ExperienceCategory } from "../enums/category.enum";
import type {
  ExperienceModel,
  ExperienceRoleModel,
} from "../schemas/experience.schema";

function toExperienceRoleRecord(
  model: ExperienceRoleModel
): ExperienceRoleRecord {
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

function mapRolesForPersistence<TRole extends { skillIds?: string[] }>(
  roles: TRole[]
) {
  return roles.map((role) => ({
    ...role,
    skillIds: toObjectIds(role.skillIds),
  }));
}

export class ExperienceMapper
  implements CrudMapperInterface<ExperienceEntityRecord, ExperienceModel>
{
  toDomain(model: ExperienceModel): ExperienceEntityRecord {
    return {
      ...toBaseEntityFields(model),
      relevance: model.relevance,
      slug: model.slug,
      ownerId: toIdString(model.ownerId) ?? "",
      organizationId: toIdString(model.organizationId) ?? "",
      category: model.category as ExperienceCategory,
      roles: model.roles.map(toExperienceRoleRecord),
    };
  }

  toPersistenceForCreate(
    entity: CreateExperienceInput
  ): AnyKeys<ExperienceModel> {
    return {
      ...entity,
      organizationId: toObjectId(entity.organizationId),
      roles: mapRolesForPersistence(entity.roles),
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
      roles: entity.roles ? mapRolesForPersistence(entity.roles) : undefined,
    };
  }

  toPersistenceForFilter(
    entity: FilterExperienceInput
  ): QueryFilter<ExperienceModel> {
    return { ...entity } as QueryFilter<ExperienceModel>;
  }

  toPersistenceForSort(
    entity: SortExperienceInput
  ): Record<keyof ExperienceModel, SortOrder> {
    return { ...entity } as Record<keyof ExperienceModel, SortOrder>;
  }
}
