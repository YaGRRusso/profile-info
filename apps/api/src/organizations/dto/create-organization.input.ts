import { Field, InputType } from "@nestjs/graphql";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { OrganizationCategory } from "../enums/category.enum";

@InputType()
export class CreateOrganizationMessagesInput {
  @Field(() => String)
  description: string;
}

@InputType()
export class CreateOrganizationTranslationInput {
  @Field(() => String)
  locale: string;

  @Field(() => CreateOrganizationMessagesInput)
  messages: CreateOrganizationMessagesInput;
}

@InputType()
export class CreateOrganizationInput {
  @OptionalField(() => Number)
  relevance?: number;

  @Field(() => String)
  slug: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  website: string;

  @Field(() => String)
  logo: string;

  @Field(() => [CreateOrganizationTranslationInput])
  i18n: CreateOrganizationTranslationInput[];

  @Field(() => OrganizationCategory)
  category: OrganizationCategory;
}
