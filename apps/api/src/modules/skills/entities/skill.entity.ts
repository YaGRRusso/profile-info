import { Field, ObjectType } from "@nestjs/graphql";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { BaseEntity } from "@/core/entities/base.entity";
import { createPaginatedModel } from "@/core/schemas/paginated.schema";

@ObjectType()
export class SkillMessages {
  @Field(() => String)
  title: string;
}

@ObjectType()
export class SkillTranslationLocale {
  @Field(() => String)
  locale: string;

  @Field(() => SkillMessages)
  messages: SkillMessages;
}

@ObjectType()
export class SkillEntity extends BaseEntity {
  @Field(() => String)
  slug: string;

  @Field(() => [SkillTranslationLocale])
  i18n: SkillTranslationLocale[];

  @OptionalField(() => String)
  category?: string;

  @Field(() => Boolean)
  disabled: boolean;
}

export const PaginatedSkillEntity = createPaginatedModel(SkillEntity);
