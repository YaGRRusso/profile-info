import { Field, InputType } from "@nestjs/graphql";

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

  @Field(() => String)
  category: string;
}
