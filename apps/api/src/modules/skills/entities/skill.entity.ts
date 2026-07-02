import { Field, ObjectType } from "@nestjs/graphql";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { BaseEntity } from "@/core/entities/base.entity";
import { createPaginatedModel } from "@/core/schemas/paginated.schema";
@ObjectType()
export class SkillEntity extends BaseEntity {
  @Field(() => String)
  slug: string;

  @Field(() => String)
  name: string;

  @OptionalField(() => String)
  category?: string;

  @Field(() => Boolean)
  disabled: boolean;
}

export const PaginatedSkillEntity = createPaginatedModel(SkillEntity);
