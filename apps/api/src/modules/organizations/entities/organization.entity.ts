import { Field, ID, ObjectType } from "@nestjs/graphql";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { BaseEntity } from "@/core/entities/base.entity";
import { CatalogPartition } from "@/core/enums/catalog-partition.enum";
import { createPaginatedModel } from "@/core/schemas/paginated.schema";
import { UserEntity } from "@/modules/users/entities/user.entity";
import { OrganizationCategory } from "../enums/category.enum";

@ObjectType()
export class OrganizationMessages {
  @Field(() => String)
  description: string;
}

@ObjectType()
export class OrganizationTranslationLocale {
  @Field(() => String)
  locale: string;

  @Field(() => OrganizationMessages)
  messages: OrganizationMessages;
}

@ObjectType()
export class OrganizationEntity extends BaseEntity {
  @OptionalField(() => String)
  slug?: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  website?: string;

  @Field(() => String, { nullable: true })
  logo?: string;

  @Field(() => [OrganizationTranslationLocale])
  i18n: OrganizationTranslationLocale[];

  @Field(() => OrganizationCategory)
  category: OrganizationCategory;

  @Field(() => Boolean)
  disabled: boolean;

  @Field(() => CatalogPartition)
  partition: CatalogPartition;

  @Field(() => ID)
  ownerId: string;

  @Field(() => UserEntity)
  owner: UserEntity;
}

export const PaginatedOrganizationEntity =
  createPaginatedModel(OrganizationEntity);

export type OrganizationEntityRecord = Omit<OrganizationEntity, "owner">;
