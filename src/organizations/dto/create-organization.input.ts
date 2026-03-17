import { Field, InputType } from "@nestjs/graphql";
import { OrganizationCategory } from "../enums/category.enum";

@InputType()
export class CreateOrganizationInput {
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
