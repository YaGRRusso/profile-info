import { Field, ObjectType } from "@nestjs/graphql";
import { BaseEntity } from "@/core/entities/base.entity";
import { ApiTokenPermission } from "@/core/enums/api-token-permission.enum";
import { createPaginatedModel } from "@/core/schemas/paginated.schema";
import { UserEntity } from "@/modules/users/entities/user.entity";

@ObjectType()
export class ApiTokenEntity extends BaseEntity {
  @Field(() => String)
  ownerId: string;

  @Field(() => UserEntity)
  owner: UserEntity;

  @Field(() => String)
  name: string;

  @Field(() => [ApiTokenPermission])
  permissions: ApiTokenPermission[];

  @Field(() => Date, { nullable: true })
  expiresAt?: Date;
}

export type ApiTokenEntityRecord = Omit<ApiTokenEntity, "owner">;

@ObjectType()
export class NewApiTokenEntity {
  @Field(() => String)
  token: string;

  @Field(() => ApiTokenEntity)
  apiToken: ApiTokenEntityRecord;
}

export const PaginatedApiTokenEntity = createPaginatedModel(ApiTokenEntity);
