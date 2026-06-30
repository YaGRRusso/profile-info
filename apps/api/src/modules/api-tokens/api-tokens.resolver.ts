import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import type { AuthContext } from "@/core/context/auth-context.interface";
import { SessionOnly } from "@/core/decorators/session-only.decorator";
import { BatchEntity } from "@/core/entities/batch.entity";
import { PaginationInput } from "@/core/inputs/pagination.input";
import { Auth } from "@/modules/auth/decorators/auth-context.decorator";
import { ApiTokensService } from "./api-tokens.service";
import { CreateApiTokenInput } from "./dto/create-api-token.input";
import { FilterApiTokenInput } from "./dto/filter-api-token.input";
import { SortApiTokenInput } from "./dto/sort-api-token.input";
import { UpdateApiTokenInput } from "./dto/update-api-token.input";
import {
  ApiTokenEntity,
  NewApiTokenEntity,
  PaginatedApiTokenEntity,
} from "./entities/api-token.entity";

@SessionOnly()
@Resolver(() => ApiTokenEntity)
export class ApiTokensResolver {
  constructor(private readonly apiTokensService: ApiTokensService) {}

  // QUERIES

  @Query(() => ApiTokenEntity)
  findOneApiTokenById(
    @Auth() ctx: AuthContext,
    @Args("apiTokenId", { type: () => ID }) apiTokenId: string
  ) {
    return this.apiTokensService.findOneById(ctx, apiTokenId);
  }

  @Query(() => ApiTokenEntity)
  findOneApiToken(
    @Auth() ctx: AuthContext,
    @Args("apiTokenFilters", {
      type: () => FilterApiTokenInput,
      nullable: true,
    })
    apiTokenFilters?: FilterApiTokenInput
  ) {
    return this.apiTokensService.findOne(ctx, { filters: apiTokenFilters });
  }

  @Query(() => [ApiTokenEntity])
  findManyApiTokenById(
    @Auth() ctx: AuthContext,
    @Args("apiTokenIds", { type: () => [ID] }) apiTokenIds: string[]
  ) {
    return this.apiTokensService.findManyById(ctx, apiTokenIds);
  }

  @Query(() => PaginatedApiTokenEntity)
  findManyApiTokens(
    @Auth() ctx: AuthContext,
    @Args("apiTokenFilters", {
      type: () => FilterApiTokenInput,
      nullable: true,
    })
    apiTokenFilters?: FilterApiTokenInput,
    @Args("apiTokenPagination", {
      type: () => PaginationInput,
      nullable: true,
    })
    apiTokenPagination?: PaginationInput,
    @Args("apiTokenSort", {
      type: () => SortApiTokenInput,
      nullable: true,
    })
    apiTokenSort?: SortApiTokenInput
  ) {
    return this.apiTokensService.findMany(ctx, {
      filters: apiTokenFilters,
      sort: apiTokenSort,
      limit: apiTokenPagination?.limit,
      skip: apiTokenPagination?.skip,
    });
  }

  // MUTATIONS

  @Mutation(() => NewApiTokenEntity)
  createOneApiToken(
    @Auth() ctx: AuthContext,
    @Args("createApiTokenInput", { type: () => CreateApiTokenInput })
    createApiTokenInput: CreateApiTokenInput
  ) {
    return this.apiTokensService.createOne(ctx, createApiTokenInput);
  }

  @Mutation(() => ApiTokenEntity)
  updateOneApiToken(
    @Auth() ctx: AuthContext,
    @Args("apiTokenId", { type: () => ID }) apiTokenId: string,
    @Args("updateApiTokenInput", { type: () => UpdateApiTokenInput })
    updateApiTokenInput: UpdateApiTokenInput
  ) {
    return this.apiTokensService.updateOne(
      ctx,
      apiTokenId,
      updateApiTokenInput
    );
  }

  @Mutation(() => BatchEntity)
  updateManyApiTokens(
    @Auth() ctx: AuthContext,
    @Args("apiTokenIds", { type: () => [ID] }) apiTokenIds: string[],
    @Args("updateApiTokenInput", { type: () => UpdateApiTokenInput })
    updateApiTokenInput: UpdateApiTokenInput
  ) {
    return this.apiTokensService.updateMany(
      ctx,
      apiTokenIds,
      updateApiTokenInput
    );
  }

  @Mutation(() => ApiTokenEntity)
  removeOneApiToken(
    @Auth() ctx: AuthContext,
    @Args("apiTokenId", { type: () => ID }) apiTokenId: string
  ) {
    return this.apiTokensService.removeOne(ctx, apiTokenId);
  }

  @Mutation(() => BatchEntity)
  removeManyApiTokens(
    @Auth() ctx: AuthContext,
    @Args("apiTokenIds", { type: () => [ID] }) apiTokenIds: string[]
  ) {
    return this.apiTokensService.removeMany(ctx, apiTokenIds);
  }
}
