import { Field, ObjectType } from "@nestjs/graphql";
import { BaseEntity } from "@/core/entities/base.entity";

@ObjectType()
export class Organization extends BaseEntity {
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
