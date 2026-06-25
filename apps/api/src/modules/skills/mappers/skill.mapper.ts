import { toBaseEntityFields } from "@/core/mappers/base.mapper";
import type { SkillEntity } from "../entities/skill.entity";
import type { SkillCategory } from "../enums/category.enum";
import type { SkillModel } from "../schemas/skill.schema";

export function toSkillEntity(model: SkillModel): SkillEntity {
  return {
    ...toBaseEntityFields(model),
    relevance: model.relevance,
    slug: model.slug,
    name: model.name,
    category: model.category as SkillCategory,
  };
}
