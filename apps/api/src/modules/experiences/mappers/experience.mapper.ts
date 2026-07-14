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
          description: entry.messages.description,
          title: entry.messages.title,
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
      organizationId: toIdString(model.organizationId),
      ownerId: toIdString(model.ownerId) ?? "",
      relevance: model.relevance,
      roles: model.roles.map(toExperienceRoleRecord),
      slug: model.slug,
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
    const { roles, ...rest } = entity;
    const filter = withObjectIdRefs(rest, { single: ["organizationId"] });
    if (!roles) return filter;

    return {
      ...filter,
      roles: mapRolesForPersistence(roles),
    } as QueryFilter<ExperienceModel>;
  }

  toPersistenceForSort(
    entity: SortExperienceInput
  ): Record<keyof ExperienceModel, SortOrder> {
    return toPersistenceSort<SortExperienceInput, ExperienceModel>(entity);
  }
}
