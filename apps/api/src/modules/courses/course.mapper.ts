import mongoose, {
  AnyKeys,
  QueryFilter,
  SortOrder,
  UpdateQuery,
} from "mongoose";
import { clearObject } from "@/common/helpers/object.helper";
import {
  toBaseEntityFields,
  toIdString,
  toIdStrings,
} from "@/core/mappers/base.mapper";
import { toTranslationEntityList } from "@/core/mappers/translation.mapper";
import type { CrudMapperInterface } from "@/core/persistence/repositories/crud/crud.interface";
import { CreateCourseInput } from "./dto/create-course.input";
import { FilterCourseInput } from "./dto/filter-course.input";
import { SortCourseInput } from "./dto/sort-course.input";
import { UpdateCourseInput } from "./dto/update-course.input";
import { CourseEntityRecord } from "./entities/course.entity";
import { CourseStatus } from "./enums/status.enum";
import { CourseModel } from "./schemas/course.schema";

export class CourseMapper
  implements CrudMapperInterface<CourseEntityRecord, CourseModel>
{
  toDomain(model: CourseModel): CourseEntityRecord {
    return {
      ...toBaseEntityFields(model),
      relevance: model.relevance,
      slug: model.slug,
      status: model.status as CourseStatus,
      url: model.url,
      image: model.image,
      hours: model.hours,
      ownerId: toIdString(model.ownerId) ?? "",
      organizationId: toIdString(model.organizationId) ?? "",
      skillIds: toIdStrings(model.skillIds),
      i18n:
        toTranslationEntityList(model.i18n)?.map((entry) => ({
          locale: entry.locale,
          messages: {
            title: entry.messages.title,
            description: entry.messages.description,
          },
        })) ?? [],
    };
  }

  toPersistenceForCreate(entity: CreateCourseInput): AnyKeys<CourseModel> {
    return {
      ...entity,
      organizationId: new mongoose.Types.ObjectId(entity.organizationId),
    };
  }

  toPersistenceForUpdate(entity: UpdateCourseInput): UpdateQuery<CourseModel> {
    return {
      ...entity,
      organizationId: entity.organizationId
        ? new mongoose.Types.ObjectId(entity.organizationId)
        : undefined,
    };
  }

  toPersistenceForFilter(entity: FilterCourseInput): QueryFilter<CourseModel> {
    const obj = clearObject(entity);
    return { ...obj } as QueryFilter<CourseModel>;
  }

  toPersistenceForSort(
    entity: SortCourseInput
  ): Record<keyof CourseModel, SortOrder> {
    const obj = clearObject(entity);
    return { ...obj } as Record<keyof CourseModel, SortOrder>;
  }
}
