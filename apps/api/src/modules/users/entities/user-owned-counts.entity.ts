import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class UserOwnedCounts {
  @Field(() => Int)
  experiences: number;

  @Field(() => Int)
  educations: number;

  @Field(() => Int)
  courses: number;

  @Field(() => Int)
  projects: number;
}
