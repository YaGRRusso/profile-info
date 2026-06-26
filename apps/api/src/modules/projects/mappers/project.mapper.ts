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
  toObjectIds,
} from "@/core/mappers/base.mapper";
import { toTranslationEntityList } from "@/core/mappers/translation.mapper";
import { toUrlEntityList } from "@/core/mappers/url.mapper";
import { withObjectIdRefs } from "@/core/persistence/helpers/filter-ref.helper";
import { toPersistenceSort } from "@/core/persistence/helpers/sort-ref.helper";
import type { CrudMapperInterface } from "@/core/persistence/repositories/crud/crud.interface";
import { CreateProjectInput } from "../dto/create-project.input";
import { FilterProjectInput } from "../dto/filter-project.input";
import { SortProjectInput } from "../dto/sort-project.input";
import { UpdateProjectInput } from "../dto/update-project.input";
import type { ProjectEntityRecord } from "../entities/project.entity";
import type { ProjectModel } from "../schemas/project.schema";

export class ProjectMapper
  implements
    CrudMapperInterface<
      ProjectEntityRecord,
      ProjectModel,
      CreateProjectInput,
      UpdateProjectInput,
      FilterProjectInput,
      SortProjectInput
    >
{
  toDomain(model: ProjectModel): ProjectEntityRecord {
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
    };
  }

  toPersistenceForCreate(entity: CreateProjectInput): AnyKeys<ProjectModel> {
    return {
      ...entity,
      skillIds: toObjectIds(entity.skillIds),
    };
  }

  toPersistenceForUpdate(
    entity: UpdateProjectInput
  ): UpdateQuery<ProjectModel> {
    return {
      ...entity,
      skillIds: toObjectIds(entity.skillIds),
    };
  }

  toPersistenceForFilter(
    entity: FilterProjectInput
  ): QueryFilter<ProjectModel> {
    return withObjectIdRefs(entity, { array: ["skillIds"] });
  }

  toPersistenceForSort(
    entity: SortProjectInput
  ): Record<keyof ProjectModel, SortOrder> {
    return toPersistenceSort<SortProjectInput, ProjectModel>(entity);
  }
}
