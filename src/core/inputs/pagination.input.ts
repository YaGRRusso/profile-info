import { Field, InputType, Int } from "@nestjs/graphql";
import { Max } from "class-validator";

@InputType()
export class PaginationInput {
  @Field(() => Int, { defaultValue: 0, nullable: true })
  skip?: number;

  @Field(() => Int, { defaultValue: 10, nullable: true })
  @Max(10)
  limit?: number;
}
