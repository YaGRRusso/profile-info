import {
  type AnyKeys,
  type QueryFilter,
  type SortOrder,
  type UpdateQuery,
} from "mongoose";
import { toBaseEntityFields, toIdString } from "@/core/mappers/base.mapper";
import { toTranslationEntityList } from "@/core/mappers/translation.mapper";
import { withObjectIdRefs } from "@/core/persistence/helpers/filter-ref.helper";
import { toPersistenceSort } from "@/core/persistence/helpers/sort-ref.helper";
import type { CrudMapperInterface } from "@/core/persistence/repositories/crud/crud.interface";
import { CreateSkillInput } from "../dto/create-skill.input";
import { FilterSkillInput } from "../dto/filter-skill.input";
import { SortSkillInput } from "../dto/sort-skill.input";
import { UpdateSkillInput } from "../dto/update-skill.input";
import type { SkillEntityRecord } from "../entities/skill.entity";
import type { SkillModel } from "../schemas/skill.schema";

export class SkillMapper
  implements
    CrudMapperInterface<
      SkillEntityRecord,
      SkillModel,
      CreateSkillInput,
      UpdateSkillInput,
      FilterSkillInput,
      SortSkillInput
    >
{
  toDomain(model: SkillModel): SkillEntityRecord {
    return {
      ...toBaseEntityFields(model),
      slug: model.slug,
      i18n:
        toTranslationEntityList(model.i18n)?.map((entry) => ({
          locale: entry.locale,
          messages: { title: entry.messages.title },
        })) ?? [],
      category: model.category,
      disabled: model.disabled,
      partition: model.partition,
      ownerId: toIdString(model.ownerId) ?? "",
    };
  }

  toPersistenceForCreate(entity: CreateSkillInput): AnyKeys<SkillModel> {
    return { ...entity };
  }

  toPersistenceForUpdate(entity: UpdateSkillInput): UpdateQuery<SkillModel> {
    return { ...entity };
  }

  toPersistenceForFilter(entity: FilterSkillInput): QueryFilter<SkillModel> {
    return withObjectIdRefs(entity, { single: ["ownerId"] });
  }

  toPersistenceForSort(
    entity: SortSkillInput
  ): Record<keyof SkillModel, SortOrder> {
    return toPersistenceSort<SortSkillInput, SkillModel>(entity);
  }
}
