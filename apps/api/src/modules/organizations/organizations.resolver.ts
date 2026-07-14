import {
  Args,
  Context,
  ID,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";
import type { AuthContext } from "@/core/context/auth-context.interface";
import type { GraphqlContext } from "@/core/context/graphql-context.interface";
import { BatchEntity } from "@/core/entities/batch.entity";
import { PaginationInput } from "@/core/inputs/pagination.input";
import { Auth } from "@/modules/auth/decorators/auth-context.decorator";
import { UserEntity } from "../users/entities/user.entity";
import { CreateOrganizationInput } from "./dto/create-organization.input";
import { FilterOrganizationInput } from "./dto/filter-organization.input";
import { SortOrganizationInput } from "./dto/sort-organization.input";
import { UpdateOrganizationInput } from "./dto/update-organization.input";
import {
  OrganizationEntity,
  type OrganizationEntityRecord,
  PaginatedOrganizationEntity,
} from "./entities/organization.entity";
import { OrganizationsService } from "./organizations.service";

@Resolver(() => OrganizationEntity)
export class OrganizationsResolver {
  constructor(private readonly organizationsService: OrganizationsService) {}

  // QUERIES

  @Query(() => OrganizationEntity)
  findOneOrganizationById(
    @Auth() ctx: AuthContext,
    @Args("organizationId", { type: () => ID }) organizationId: string
  ) {
    return this.organizationsService.findOneById(ctx, organizationId);
  }

  @Query(() => OrganizationEntity)
  findOneOrganization(
    @Auth() ctx: AuthContext,
    @Args("organizationFilters", {
      nullable: true,
      type: () => FilterOrganizationInput,
    })
    organizationFilters?: FilterOrganizationInput
  ) {
    return this.organizationsService.findOne(ctx, {
      filters: organizationFilters,
    });
  }

  @Query(() => OrganizationEntity)
  findOneActiveOrganization(
    @Auth() ctx: AuthContext,
    @Args("organizationFilters", {
      nullable: true,
      type: () => FilterOrganizationInput,
    })
    organizationFilters?: FilterOrganizationInput
  ) {
    return this.organizationsService.findOneActive(ctx, {
      filters: organizationFilters,
    });
  }

  @Query(() => [OrganizationEntity])
  findManyOrganizationById(
    @Auth() ctx: AuthContext,
    @Args("organizationIds", { type: () => [ID] }) organizationIds: string[]
  ) {
    return this.organizationsService.findManyById(ctx, organizationIds);
  }

  @Query(() => PaginatedOrganizationEntity)
  findManyOrganizations(
    @Auth() ctx: AuthContext,
    @Args("organizationFilters", {
      nullable: true,
      type: () => FilterOrganizationInput,
    })
    organizationFilters?: FilterOrganizationInput,
    @Args("organizationPagination", {
      nullable: true,
      type: () => PaginationInput,
    })
    organizationPagination?: PaginationInput,
    @Args("organizationSort", {
      nullable: true,
      type: () => SortOrganizationInput,
    })
    organizationSort?: SortOrganizationInput
  ) {
    return this.organizationsService.findMany(ctx, {
      filters: organizationFilters,
      limit: organizationPagination?.limit,
      skip: organizationPagination?.skip,
      sort: organizationSort,
    });
  }

  @Query(() => PaginatedOrganizationEntity)
  findManyActiveOrganizations(
    @Auth() ctx: AuthContext,
    @Args("organizationFilters", {
      nullable: true,
      type: () => FilterOrganizationInput,
    })
    organizationFilters?: FilterOrganizationInput,
    @Args("organizationPagination", {
      nullable: true,
      type: () => PaginationInput,
    })
    organizationPagination?: PaginationInput,
    @Args("organizationSort", {
      nullable: true,
      type: () => SortOrganizationInput,
    })
    organizationSort?: SortOrganizationInput
  ) {
    return this.organizationsService.findManyActive(ctx, {
      filters: organizationFilters,
      limit: organizationPagination?.limit,
      skip: organizationPagination?.skip,
      sort: organizationSort,
    });
  }

  // MUTATIONS

  @Mutation(() => OrganizationEntity)
  createOneOrganization(
    @Auth() ctx: AuthContext,
    @Args("createOrganizationInput", { type: () => CreateOrganizationInput })
    createOrganizationInput: CreateOrganizationInput
  ) {
    return this.organizationsService.createOne(ctx, createOrganizationInput);
  }

  @Mutation(() => BatchEntity)
  createManyOrganizations(
    @Auth() ctx: AuthContext,
    @Args("createOrganizationInputs", { type: () => [CreateOrganizationInput] })
    createOrganizationInputs: CreateOrganizationInput[]
  ) {
    return this.organizationsService.createMany(ctx, createOrganizationInputs);
  }

  @Mutation(() => OrganizationEntity)
  updateOneOrganization(
    @Auth() ctx: AuthContext,
    @Args("organizationId", { type: () => ID }) organizationId: string,
    @Args("updateOrganizationInput", { type: () => UpdateOrganizationInput })
    updateOrganizationInput: UpdateOrganizationInput
  ) {
    return this.organizationsService.updateOne(
      ctx,
      organizationId,
      updateOrganizationInput
    );
  }

  @Mutation(() => BatchEntity)
  updateManyOrganizations(
    @Auth() ctx: AuthContext,
    @Args("organizationIds", { type: () => [ID] }) organizationIds: string[],
    @Args("updateOrganizationInput", { type: () => UpdateOrganizationInput })
    updateOrganizationInput: UpdateOrganizationInput
  ) {
    return this.organizationsService.updateMany(
      ctx,
      organizationIds,
      updateOrganizationInput
    );
  }

  @Mutation(() => OrganizationEntity)
  removeOneOrganization(
    @Auth() ctx: AuthContext,
    @Args("organizationId", { type: () => ID }) organizationId: string
  ) {
    return this.organizationsService.removeOne(ctx, organizationId);
  }

  @Mutation(() => BatchEntity)
  removeManyOrganizations(
    @Auth() ctx: AuthContext,
    @Args("organizationIds", { type: () => [ID] }) organizationIds: string[]
  ) {
    return this.organizationsService.removeMany(ctx, organizationIds);
  }

  @Mutation(() => OrganizationEntity)
  disableOneOrganization(
    @Auth() ctx: AuthContext,
    @Args("organizationId", { type: () => ID }) organizationId: string
  ) {
    return this.organizationsService.disableOne(ctx, organizationId);
  }

  @Mutation(() => BatchEntity)
  disableManyOrganizations(
    @Auth() ctx: AuthContext,
    @Args("organizationIds", { type: () => [ID] }) organizationIds: string[]
  ) {
    return this.organizationsService.disableMany(ctx, organizationIds);
  }

  @Mutation(() => OrganizationEntity)
  enableOneOrganization(
    @Auth() ctx: AuthContext,
    @Args("organizationId", { type: () => ID }) organizationId: string
  ) {
    return this.organizationsService.enableOne(ctx, organizationId);
  }

  @Mutation(() => BatchEntity)
  enableManyOrganizations(
    @Auth() ctx: AuthContext,
    @Args("organizationIds", { type: () => [ID] }) organizationIds: string[]
  ) {
    return this.organizationsService.enableMany(ctx, organizationIds);
  }

  @ResolveField(() => UserEntity)
  owner(
    @Parent() organization: OrganizationEntityRecord,
    @Context() ctx: GraphqlContext
  ) {
    if (!organization?.ownerId) return null;
    return ctx.loaders.batchUsers.load(organization.ownerId);
  }
}
