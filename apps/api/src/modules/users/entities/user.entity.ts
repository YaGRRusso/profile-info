import { Field, ObjectType } from "@nestjs/graphql";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { BaseEntity } from "@/core/entities/base.entity";
import { UrlEntity } from "@/core/entities/url.entity";
import { UserRole } from "@/core/enums/user-role.enum";
import { createPaginatedModel } from "@/core/schemas/paginated.schema";

@ObjectType()
export class UserEntity extends BaseEntity {
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

  @Field(() => UserRole, { defaultValue: UserRole.USER })
  role?: UserRole;

  @OptionalField(() => [UrlEntity])
  urls?: UrlEntity[];
}

export const PaginatedUserEntity = createPaginatedModel(UserEntity);
