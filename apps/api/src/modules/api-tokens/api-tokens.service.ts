import { Injectable, UnauthorizedException } from "@nestjs/common";
import { hash } from "bcryptjs";
import { toTenantScope } from "@/core/context/auth-context.helper";
import type { AuthContext } from "@/core/context/auth-context.interface";
import { BatchEntity } from "@/core/entities/batch.entity";
import type { MultiPaged } from "@/core/persistence/types/output.type";
import { ApiTokensRepository } from "./api-tokens.repository";
import { CreateApiTokenInput } from "./dto/create-api-token.input";
import { FilterApiTokenInput } from "./dto/filter-api-token.input";
import { SortApiTokenInput } from "./dto/sort-api-token.input";
import { UpdateApiTokenInput } from "./dto/update-api-token.input";
import { ApiTokenEntity, NewApiTokenEntity } from "./entities/api-token.entity";
import {
  emitApiToken,
  parseApiToken,
  verifyApiToken,
} from "./helpers/api-token-secret.helper";
import type { ApiTokenCreateRecord } from "./mappers/api-token.mapper";

@Injectable()
export class ApiTokensService {
  constructor(private readonly repository: ApiTokensRepository) {}

  findOneById(ctx: AuthContext, id: string): Promise<ApiTokenEntity> {
    return this.repository.crud.scoped(toTenantScope(ctx)).findOneById(id);
  }

  findManyById(ctx: AuthContext, ids: string[]): Promise<ApiTokenEntity[]> {
    return this.repository.crud.scoped(toTenantScope(ctx)).findManyById(ids);
  }

  findOne(
    ctx: AuthContext,
    { filters }: { filters?: FilterApiTokenInput } = {}
  ): Promise<ApiTokenEntity> {
    return this.repository.crud.scoped(toTenantScope(ctx)).findOne({ filters });
  }

  findMany(
    ctx: AuthContext,
    {
      filters,
      sort,
      skip = 0,
      limit = 50,
    }: {
      filters?: FilterApiTokenInput;
      sort?: SortApiTokenInput;
      skip?: number;
      limit?: number;
    } = {}
  ): Promise<MultiPaged<ApiTokenEntity>> {
    return this.repository.crud.scoped(toTenantScope(ctx)).findMany({
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
    const { plaintext, tokenId, secret } = emitApiToken();

    const createInput: ApiTokenCreateRecord = {
      ...input,
      id: tokenId,
      hashedSecret: await hash(secret, 8),
    };

    const apiToken = await this.repository.crud
      .scoped(toTenantScope(ctx))
      .createOne(createInput);

    return { token: plaintext, apiToken };
  }

  updateOne(
    ctx: AuthContext,
    id: string,
    updateInput: UpdateApiTokenInput
  ): Promise<ApiTokenEntity> {
    return this.repository.crud
      .scoped(toTenantScope(ctx))
      .updateOneById(id, updateInput);
  }

  updateMany(
    ctx: AuthContext,
    ids: string[],
    updateInput: UpdateApiTokenInput
  ): Promise<BatchEntity> {
    return this.repository.crud
      .scoped(toTenantScope(ctx))
      .updateManyById(ids, updateInput);
  }

  removeOne(ctx: AuthContext, id: string): Promise<ApiTokenEntity> {
    return this.repository.crud.scoped(toTenantScope(ctx)).deleteOneById(id);
  }

  removeMany(ctx: AuthContext, ids: string[]): Promise<BatchEntity> {
    return this.repository.crud.scoped(toTenantScope(ctx)).deleteManyById(ids);
  }

  async verify(plaintext: string) {
    const parsed = parseApiToken(plaintext);
    if (!parsed) {
      throw new UnauthorizedException();
    }

    const record = await this.repository.findByIdForAuth(parsed.tokenId);
    if (!record) {
      throw new UnauthorizedException();
    }

    if (record.expiresAt && record.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException();
    }

    const secretMatches = await verifyApiToken(
      parsed.secret,
      record.hashedSecret
    );
    if (!secretMatches) {
      throw new UnauthorizedException();
    }

    return {
      ownerId: record.ownerId,
      permissions: record.permissions,
    };
  }
}
