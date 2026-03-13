import { Field, ObjectType } from "@nestjs/graphql";
import { BaseEntity } from "@/core/entities/base.entity";

@ObjectType()
export class Organization extends BaseEntity {
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
