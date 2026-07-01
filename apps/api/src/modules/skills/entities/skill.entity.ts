import { Field, ObjectType } from "@nestjs/graphql";
import { BaseEntity } from "@/core/entities/base.entity";
import { createPaginatedModel } from "@/core/schemas/paginated.schema";
import { SkillCategory } from "../enums/category.enum";

@ObjectType()
export class SkillEntity extends BaseEntity {
  @Field(() => Number)
  relevance: number;

  @Field(() => String)
  slug: string;

  @Field(() => String)
  name: string;

  @Field(() => SkillCategory)
  category: SkillCategory;

  @Field(() => Boolean)
  disabled: boolean;
}

export const PaginatedSkillEntity = createPaginatedModel(SkillEntity);
