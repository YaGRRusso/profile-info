import { Field, ObjectType } from "@nestjs/graphql";
import { BaseEntity } from "@/core/entities/base.entity";
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
  @Field(() => Number)
  relevance: number;

  @Field(() => String)
  slug: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  website: string;

  @Field(() => String)
  logo: string;

  @Field(() => [OrganizationTranslationLocale])
  i18n: OrganizationTranslationLocale[];

  @Field(() => OrganizationCategory)
  category: OrganizationCategory;
}
