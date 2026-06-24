import { Field, ObjectType } from "@nestjs/graphql";
import { BaseEntity } from "@/core/entities/base.entity";
import { ApiTokenPermission } from "@/core/enums/api-token-permission.enum";
import { createPaginatedModel } from "@/core/schemas/paginated.schema";

@ObjectType()
export class ApiTokenEntity extends BaseEntity {
  @Field(() => String)
  ownerId: string;

  @Field(() => String)
  name: string;

  @Field(() => [ApiTokenPermission])
  permissions: ApiTokenPermission[];

  @Field(() => Date, { nullable: true })
  expiresAt?: Date;
}

@ObjectType()
export class NewApiTokenEntity {
  @Field(() => String)
  token: string;

  @Field(() => ApiTokenEntity)
  apiToken: ApiTokenEntity;
}

export const PaginatedApiTokenEntity = createPaginatedModel(ApiTokenEntity);
