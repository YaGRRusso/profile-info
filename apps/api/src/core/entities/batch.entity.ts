import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class BatchEntity {
  @Field(() => Int)
  succeeded: number;

  @Field(() => Int)
  failed: number;
}
