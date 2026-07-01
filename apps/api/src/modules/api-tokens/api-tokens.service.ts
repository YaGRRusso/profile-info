import { randomBytes } from "node:crypto";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { compare, hash } from "bcryptjs";
import mongoose from "mongoose";
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
import { ApiTokenWithHashedEntity } from "./entities/api-token-with-hashed.entity";

import type { ApiTokenCreateRecord } from "./mappers/api-token.mapper";

@Injectable()
export class ApiTokensService {
  private readonly API_TOKEN_PREFIX = "pi_";
  private readonly TOKEN_ID_PATTERN = /^[a-f0-9]{24}$/;

  constructor(private readonly repository: ApiTokensRepository) {}

  findOneByIdWithHashedSecret(id: string): Promise<ApiTokenWithHashedEntity> {
    return this.repository.findOneByIdWithHashedSecret(id);
  }

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
    const { plaintext, tokenId, secret } = this.emitApiToken();

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

  async validate(plaintext: string) {
    const parsed = this.parseApiToken(plaintext);
    if (!parsed) {
      throw new UnauthorizedException();
    }

    const record = await this.findOneByIdWithHashedSecret(parsed.tokenId);
    if (!record) {
      throw new UnauthorizedException();
    }

    if (record.expiresAt && record.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException();
    }

    const secretMatches = await compare(parsed.secret, record.hashedSecret);
    if (!secretMatches) {
      throw new UnauthorizedException();
    }

    return {
      ownerId: record.ownerId,
      permissions: record.permissions,
    };
  }

  private emitApiToken(): {
    plaintext: string;
    tokenId: string;
    secret: string;
  } {
    const tokenId = new mongoose.Types.ObjectId().toHexString();
    const secret = randomBytes(32).toString("base64url");
    const plaintext = `${this.API_TOKEN_PREFIX}${tokenId}_${secret}`;
    return { plaintext, tokenId, secret };
  }

  private parseApiToken(value: string): {
    tokenId: string;
    secret: string;
  } | null {
    if (!value.startsWith(this.API_TOKEN_PREFIX)) return null;

    const payload = value.slice(this.API_TOKEN_PREFIX.length);
    const separatorIndex = payload.indexOf("_");
    if (separatorIndex <= 0) return null;

    const tokenId = payload.slice(0, separatorIndex);
    const secret = payload.slice(separatorIndex + 1);
    if (!this.TOKEN_ID_PATTERN.test(tokenId) || secret.length < 16) return null;

    return { tokenId, secret };
  }
}
