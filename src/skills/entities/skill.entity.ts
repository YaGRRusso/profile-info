import { Field, ObjectType } from "@nestjs/graphql";
import { BaseEntity } from "@/core/entities/base.entity";
import { OptionalField } from "@/core/decorators/optional-field.decorator";

@ObjectType()
export class Skill extends BaseEntity {
  @Field(() => String)
  name: string;

  @Field(() => String)
  category: string;

  @OptionalField(() => String)
  slug?: string;
}
