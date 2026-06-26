import { Injectable, UnauthorizedException } from "@nestjs/common";
import { hash } from "bcryptjs";
import { AnyKeys, QueryFilter, SortOrder, UpdateQuery } from "mongoose";
import { isSession } from "@/core/context/auth-context.helper";
import type { AuthContext } from "@/core/context/auth-context.interface";
import { BatchEntity } from "@/core/entities/batch.entity";
import type { TenantScope } from "@/core/persistence/types/scope.type";
import { PaginatedModel } from "@/core/schemas/paginated.schema";
import { ApiTokensRepository } from "./api-tokens.repository";
import { CreateApiTokenInput } from "./dto/create-api-token.input";
import { UpdateApiTokenInput } from "./dto/update-api-token.input";
import { ApiTokenEntity, NewApiTokenEntity } from "./entities/api-token.entity";
import { emitApiToken } from "./helpers/api-token-secret.helper";
import { ApiTokenModel } from "./schemas/api-token.schema";

@Injectable()
export class ApiTokensService {
  constructor(private readonly repository: ApiTokensRepository) {}

  findOneById(ctx: AuthContext, id: string): Promise<ApiTokenEntity> {
    this.assertSession(ctx);
    return this.scopedCrud(ctx).findOneById(id);
  }

  findManyById(ctx: AuthContext, ids: string[]): Promise<ApiTokenEntity[]> {
    this.assertSession(ctx);
    return this.scopedCrud(ctx).findManyById(ids);
  }

  findOne(
    ctx: AuthContext,
    { filters }: { filters?: QueryFilter<ApiTokenModel> } = {}
  ): Promise<ApiTokenEntity> {
    this.assertSession(ctx);
    return this.scopedCrud(ctx).findOne({ filters });
  }

  findMany(
    ctx: AuthContext,
    {
      filters,
      sort,
      skip = 0,
      limit = 50,
    }: {
      filters?: QueryFilter<ApiTokenModel>;
      sort?: Partial<Record<keyof ApiTokenModel, SortOrder>>;
      skip?: number;
      limit?: number;
    } = {}
  ): Promise<PaginatedModel<ApiTokenEntity>> {
    this.assertSession(ctx);
    return this.scopedCrud(ctx).findMany({ filters, sort, skip, limit });
  }

  async createOne(
    ctx: AuthContext,
    input: CreateApiTokenInput
  ): Promise<NewApiTokenEntity> {
    this.assertSession(ctx);
    const { plaintext, tokenId, secret } = emitApiToken();

    const apiToken = await this.scopedCrud(ctx).createOne({
      _id: tokenId,
      name: input.name,
      hashedSecret: await hash(secret, 8),
      permissions: input.permissions,
      expiresAt: input.expiresAt,
    } as AnyKeys<ApiTokenModel>);

    return { token: plaintext, apiToken };
  }

  updateOne(
    ctx: AuthContext,
    id: string,
    updateInput: UpdateApiTokenInput
  ): Promise<ApiTokenEntity> {
    this.assertSession(ctx);

    return this.scopedCrud(ctx).updateOneById(
      id,
      updateInput as UpdateQuery<ApiTokenModel>
    );
  }

  updateMany(
    ctx: AuthContext,
    ids: string[],
    updateInput: UpdateApiTokenInput
  ): Promise<BatchEntity> {
    this.assertSession(ctx);

    return this.scopedCrud(ctx).updateManyById(
      ids,
      updateInput as UpdateQuery<ApiTokenModel>
    );
  }

  removeOne(ctx: AuthContext, id: string): Promise<ApiTokenEntity> {
    this.assertSession(ctx);

    return this.scopedCrud(ctx).deleteOneById(id);
  }

  removeMany(ctx: AuthContext, ids: string[]): Promise<BatchEntity> {
    this.assertSession(ctx);

    return this.scopedCrud(ctx).deleteManyById(ids);
  }

  private scopedCrud(ctx: AuthContext) {
    return this.repository.crud.scoped(this.ownerScope(ctx));
  }

  private ownerScope(ctx: AuthContext): TenantScope {
    return { userId: ctx.userId, crossTenant: false };
  }

  private assertSession(ctx: AuthContext): void {
    if (!isSession(ctx)) {
      throw new UnauthorizedException();
    }
  }
}
