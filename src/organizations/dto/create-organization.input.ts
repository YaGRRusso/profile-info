import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class CreateOrganizationInput {
  @Field(() => String)
  slug: string;

  @Field(() => String)
  title: string;

  @Field(() => String)
  url: string;

  @Field(() => String)
  thumbnail: string;

  @Field(() => String)
  category: string;
}
