import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class PaginationArgs {
  @Field(() => Int, { defaultValue: 0, nullable: true })
  skip?: number;

  @Field(() => Int, { defaultValue: 10, nullable: true })
  limit?: number;
}
