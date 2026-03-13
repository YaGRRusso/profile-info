import { Field, ObjectType } from "@nestjs/graphql";
import { BaseEntity } from "@/core/entities/base.entity";

@ObjectType()
export class Skill extends BaseEntity {
  @Field(() => String)
  slug: string;

  @Field(() => String)
  title: string;

  @Field(() => String)
  category: string;
}
