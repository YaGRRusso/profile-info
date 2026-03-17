import { Field, ObjectType } from "@nestjs/graphql";
import { BaseEntity } from "@/core/entities/base.entity";
import { SkillCategory } from "../enums/category.enum";

@ObjectType()
export class Skill extends BaseEntity {
  @Field(() => String)
  slug: string;

  @Field(() => String)
  name: string;

  @Field(() => SkillCategory)
  category: SkillCategory;
}
