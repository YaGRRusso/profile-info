import { Field, ObjectType } from "@nestjs/graphql";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { BaseEntity } from "@/core/entities/base.entity";
import { SkillCategory } from "../enums/category.enum";

@ObjectType()
export class SkillEntity extends BaseEntity {
  @OptionalField(() => Number)
  relevance?: number;

  @Field(() => String)
  slug: string;

  @Field(() => String)
  name: string;

  @Field(() => SkillCategory)
  category: SkillCategory;
}
