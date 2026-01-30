import { Field, ObjectType } from "@nestjs/graphql";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { BaseEntity } from "@/core/entities/base.entity";

@ObjectType()
export class UserUrl {
  @Field(() => String)
  title: string;

  @Field(() => String)
  value: string;
}

@ObjectType()
export class User extends BaseEntity {
  @OptionalField(() => String)
  avatar?: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  nickname: string;

  @OptionalField(() => String)
  title?: string;

  @OptionalField(() => String)
  phone?: string;

  @Field(() => String)
  email: string;

  // @Field(() => String)
  // password: string;

  @OptionalField(() => String)
  birth?: Date;

  @OptionalField(() => String)
  address?: string;

  @OptionalField(() => String)
  school?: string;

  @OptionalField(() => String)
  work?: string;

  @Field(() => String, { defaultValue: "USER" })
  role?: string;

  @OptionalField(() => [UserUrl])
  urls?: UserUrl[];
}
