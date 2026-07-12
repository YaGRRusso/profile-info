import { Field, ID, ObjectType } from "@nestjs/graphql";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { BaseEntity } from "@/core/entities/base.entity";
import { CatalogPartition } from "@/core/enums/catalog-partition.enum";
import { createPaginatedModel } from "@/core/schemas/paginated.schema";
import { UserEntity } from "@/modules/users/entities/user.entity";

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
  @OptionalField(() => String)
  slug?: string;

  @Field(() => [SkillTranslationLocale])
  i18n: SkillTranslationLocale[];

  @OptionalField(() => String)
  category?: string;

  @Field(() => Boolean)
  disabled: boolean;

  @Field(() => CatalogPartition)
  partition: CatalogPartition;

  @Field(() => ID)
  ownerId: string;

  @Field(() => UserEntity)
  owner: UserEntity;
}

export const PaginatedSkillEntity = createPaginatedModel(SkillEntity);

export type SkillEntityRecord = Omit<SkillEntity, "owner">;
