import { randomBytes } from "node:crypto";
import { Injectable } from "@nestjs/common";
import { hash } from "bcryptjs";
import mongoose from "mongoose";
import type { AuthContext } from "@/core/context/auth-context.interface";
import { BatchEntity } from "@/core/entities/batch.entity";
import type { MultiPaged } from "@/core/persistence/types/output.type";
import { ApiTokensRepository } from "./api-tokens.repository";
import {
  API_TOKEN_PREFIX,
  TOKEN_ID_PATTERN,
} from "./constants/api-token.constants";
import { CreateApiTokenInput } from "./dto/create-api-token.input";
import { FilterApiTokenInput } from "./dto/filter-api-token.input";
import { SortApiTokenInput } from "./dto/sort-api-token.input";
import { UpdateApiTokenInput } from "./dto/update-api-token.input";
import {
  ApiTokenEntityRecord,
  NewApiTokenEntity,
} from "./entities/api-token.entity";
import { ApiTokenWithHashedEntity } from "./entities/api-token-with-hashed.entity";
import type { ApiTokenCreateRecord } from "./mappers/api-token.mapper";

@Injectable()
export class ApiTokensService {
  constructor(private readonly repository: ApiTokensRepository) {}

  findOneByIdWithHashedSecret(id: string): Promise<ApiTokenWithHashedEntity> {
    return this.repository.findOneByIdWithHashedSecret(id);
  }

  findOneById(ctx: AuthContext, id: string): Promise<ApiTokenEntityRecord> {
    return this.repository.tenantCrud(ctx).findOneById(id);
  }

  findManyById(
    ctx: AuthContext,
    ids: string[]
  ): Promise<ApiTokenEntityRecord[]> {
    return this.repository.tenantCrud(ctx).findManyById(ids);
  }

  findOne(
    ctx: AuthContext,
    { filters }: { filters?: FilterApiTokenInput } = {}
  ): Promise<ApiTokenEntityRecord> {
    return this.repository.tenantCrud(ctx).findOne({ filters });
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
  ): Promise<MultiPaged<ApiTokenEntityRecord>> {
    return this.repository.tenantCrud(ctx).findMany({
      filters,
      limit,
      skip,
      sort,
    });
  }

  async createOne(
    ctx: AuthContext,
    input: CreateApiTokenInput
  ): Promise<NewApiTokenEntity> {
    const { plaintext, tokenId, secret } = this.emitApiToken();

    const createInput: ApiTokenCreateRecord = {
      ...input,
      hashedSecret: await hash(secret, 8),
      id: tokenId,
    };

    const apiToken = await this.repository
      .tenantCrud(ctx)
      .createOne(createInput);

    return { apiToken, token: plaintext };
  }

  updateOne(
    ctx: AuthContext,
    id: string,
    updateInput: UpdateApiTokenInput
  ): Promise<ApiTokenEntityRecord> {
    return this.repository.tenantCrud(ctx).updateOneById(id, updateInput);
  }

  updateMany(
    ctx: AuthContext,
    ids: string[],
    updateInput: UpdateApiTokenInput
  ): Promise<BatchEntity> {
    return this.repository.tenantCrud(ctx).updateManyById(ids, updateInput);
  }

  removeOne(ctx: AuthContext, id: string): Promise<ApiTokenEntityRecord> {
    return this.repository.tenantCrud(ctx).deleteOneById(id);
  }

  removeMany(ctx: AuthContext, ids: string[]): Promise<BatchEntity> {
    return this.repository.tenantCrud(ctx).deleteManyById(ids);
  }

  async purgeByOwner(ownerId: string): Promise<void> {
    await this.repository.purgeByOwner(ownerId);
  }

  stringifyApiToken(tokenId: string, secret: string): string {
    return `${API_TOKEN_PREFIX}${tokenId}_${secret}`;
  }

  parseApiToken(value: string): {
    tokenId: string;
    secret: string;
  } | null {
    if (!value.startsWith(API_TOKEN_PREFIX)) return null;

    const payload = value.slice(API_TOKEN_PREFIX.length);
    const separatorIndex = payload.indexOf("_");
    if (separatorIndex <= 0) return null;

    const tokenId = payload.slice(0, separatorIndex);
    const secret = payload.slice(separatorIndex + 1);
    if (!TOKEN_ID_PATTERN.test(tokenId) || secret.length < 16) return null;

    return { secret, tokenId };
  }

  private emitApiToken(): {
    plaintext: string;
    tokenId: string;
    secret: string;
  } {
    const tokenId = new mongoose.Types.ObjectId().toHexString();
    const secret = randomBytes(32).toString("base64url");
    const plaintext = this.stringifyApiToken(tokenId, secret);
    return { plaintext, secret, tokenId };
  }
}
