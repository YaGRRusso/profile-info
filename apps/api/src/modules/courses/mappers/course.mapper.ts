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
import { toTranslationEntityList } from "@/core/mappers/translation.mapper";
import { withObjectIdRefs } from "@/core/persistence/helpers/filter-ref.helper";
import { toPersistenceSort } from "@/core/persistence/helpers/sort-ref.helper";
import type { CrudMapperInterface } from "@/core/persistence/repositories/crud/crud.interface";
import { CreateCourseInput } from "../dto/create-course.input";
import { FilterCourseInput } from "../dto/filter-course.input";
import { SortCourseInput } from "../dto/sort-course.input";
import { UpdateCourseInput } from "../dto/update-course.input";
import type { CourseEntityRecord } from "../entities/course.entity";
import type { CourseStatus } from "../enums/status.enum";
import type { CourseModel } from "../schemas/course.schema";

export class CourseMapper
  implements
    CrudMapperInterface<
      CourseEntityRecord,
      CourseModel,
      CreateCourseInput,
      UpdateCourseInput,
      FilterCourseInput,
      SortCourseInput
    >
{
  toDomain(model: CourseModel): CourseEntityRecord {
    return {
      ...toBaseEntityFields(model),
      hours: model.hours,
      i18n:
        toTranslationEntityList(model.i18n)?.map((entry) => ({
          locale: entry.locale,
          messages: {
            description: entry.messages.description,
            title: entry.messages.title,
          },
        })) ?? [],
      image: model.image,
      organizationId: toIdString(model.organizationId),
      ownerId: toIdString(model.ownerId) ?? "",
      relevance: model.relevance,
      skillIds: toIdStrings(model.skillIds),
      slug: model.slug,
      status: model.status as CourseStatus,
      url: model.url,
    };
  }

  toPersistenceForCreate(entity: CreateCourseInput): AnyKeys<CourseModel> {
    return {
      ...entity,
      organizationId: toObjectId(entity.organizationId),
      skillIds: toObjectIds(entity.skillIds),
    };
  }

  toPersistenceForUpdate(entity: UpdateCourseInput): UpdateQuery<CourseModel> {
    return {
      ...entity,
      organizationId: entity.organizationId
        ? toObjectId(entity.organizationId)
        : undefined,
      skillIds: toObjectIds(entity.skillIds),
    };
  }

  toPersistenceForFilter(entity: FilterCourseInput): QueryFilter<CourseModel> {
    return withObjectIdRefs(entity, {
      array: ["skillIds"],
      single: ["organizationId"],
    });
  }

  toPersistenceForSort(
    entity: SortCourseInput
  ): Record<keyof CourseModel, SortOrder> {
    return toPersistenceSort<SortCourseInput, CourseModel>(entity);
  }
}
