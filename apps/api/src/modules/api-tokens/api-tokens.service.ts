import { Injectable, UnauthorizedException } from "@nestjs/common";
import { hash } from "bcryptjs";
import { QueryFilter, SortOrder, UpdateQuery } from "mongoose";
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

  findOneById(ctx: AuthContext, id: string): Promise<ApiTokenModel> {
    this.assertSession(ctx);
    return this.repository.tenant.findOneById(this.ownerScope(ctx), id);
  }

  findManyById(ctx: AuthContext, ids: string[]): Promise<ApiTokenModel[]> {
    this.assertSession(ctx);
    return this.repository.tenant.findManyById(this.ownerScope(ctx), ids);
  }

  findOne(
    ctx: AuthContext,
    { filters }: { filters?: QueryFilter<ApiTokenModel> } = {}
  ): Promise<ApiTokenModel> {
    this.assertSession(ctx);
    return this.repository.tenant.findOne(this.ownerScope(ctx), { filters });
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
  ): Promise<PaginatedModel<ApiTokenModel>> {
    this.assertSession(ctx);
    return this.repository.tenant.findMany(this.ownerScope(ctx), {
      filters,
      sort,
      skip,
      limit,
    });
  }

  async createOne(
    ctx: AuthContext,
    input: CreateApiTokenInput
  ): Promise<NewApiTokenEntity> {
    this.assertSession(ctx);
    const { plaintext, tokenId, secret } = emitApiToken();

    const apiToken = await this.repository.tenant.createOne(
      this.ownerScope(ctx),
      {
        _id: tokenId,
        name: input.name,
        hashedSecret: await hash(secret, 8),
        permissions: input.permissions,
        expiresAt: input.expiresAt,
      }
    );

    return { token: plaintext, apiToken: this.toEntity(apiToken) };
  }

  updateOne(
    ctx: AuthContext,
    id: string,
    updateInput: UpdateApiTokenInput
  ): Promise<ApiTokenModel> {
    this.assertSession(ctx);

    return this.repository.tenant.updateOneById(
      this.ownerScope(ctx),
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

    return this.repository.tenant.updateManyById(
      this.ownerScope(ctx),
      ids,
      updateInput as UpdateQuery<ApiTokenModel>
    );
  }

  removeOne(ctx: AuthContext, id: string): Promise<ApiTokenModel> {
    this.assertSession(ctx);

    return this.repository.tenant.deleteOneById(this.ownerScope(ctx), id);
  }

  removeMany(ctx: AuthContext, ids: string[]): Promise<BatchEntity> {
    this.assertSession(ctx);

    return this.repository.tenant.deleteManyById(this.ownerScope(ctx), ids);
  }

  private toEntity(apiToken: ApiTokenModel): ApiTokenEntity {
    return {
      id: String(apiToken.id),
      ownerId: String(apiToken.ownerId),
      name: apiToken.name,
      permissions: apiToken.permissions,
      expiresAt: apiToken.expiresAt,
      createdAt: apiToken.createdAt,
      updatedAt: apiToken.updatedAt,
    };
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
