import {
  type AnyKeys,
  type QueryFilter,
  type SortOrder,
  type UpdateQuery,
} from "mongoose";
import { toBaseEntityFields } from "@/core/mappers/base.mapper";
import { withObjectIdRefs } from "@/core/persistence/helpers/filter-ref.helper";
import { toPersistenceSort } from "@/core/persistence/helpers/sort-ref.helper";
import type { CrudMapperInterface } from "@/core/persistence/repositories/crud/crud.interface";
import { CreateSkillInput } from "../dto/create-skill.input";
import { FilterSkillInput } from "../dto/filter-skill.input";
import { SortSkillInput } from "../dto/sort-skill.input";
import { UpdateSkillInput } from "../dto/update-skill.input";
import type { SkillEntity } from "../entities/skill.entity";
import type { SkillModel } from "../schemas/skill.schema";

export class SkillMapper
  implements
    CrudMapperInterface<
      SkillEntity,
      SkillModel,
      CreateSkillInput,
      UpdateSkillInput,
      FilterSkillInput,
      SortSkillInput
    >
{
  toDomain(model: SkillModel): SkillEntity {
    return {
      ...toBaseEntityFields(model),
      slug: model.slug,
      name: model.name,
      category: model.category,
      disabled: model.disabled,
    };
  }

  toPersistenceForCreate(entity: CreateSkillInput): AnyKeys<SkillModel> {
    return { ...entity };
  }

  toPersistenceForUpdate(entity: UpdateSkillInput): UpdateQuery<SkillModel> {
    return { ...entity };
  }

  toPersistenceForFilter(entity: FilterSkillInput): QueryFilter<SkillModel> {
    return withObjectIdRefs(entity, {});
  }

  toPersistenceForSort(
    entity: SortSkillInput
  ): Record<keyof SkillModel, SortOrder> {
    return toPersistenceSort<SortSkillInput, SkillModel>(entity);
  }
}
