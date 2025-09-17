import { Field, ID, ObjectType } from "@nestjs/graphql";

@ObjectType({ isAbstract: true })
export abstract class BaseEntity {
  @Field(() => ID)
  id: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
