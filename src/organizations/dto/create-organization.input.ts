import { Field, InputType } from "@nestjs/graphql";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { OrganizationCategory } from "../enums/category.enum";

@InputType()
export class CreateOrganizationInput {
  @OptionalField(() => Boolean)
  isFeatured?: boolean;

  @Field(() => String)
  slug: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  website: string;

  @Field(() => String)
  logo: string;

  @Field(() => OrganizationCategory)
  category: OrganizationCategory;
}
