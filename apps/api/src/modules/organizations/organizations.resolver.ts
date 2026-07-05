import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import type { AuthContext } from "@/core/context/auth-context.interface";
import { Roles } from "@/core/decorators/roles.decorator";
import { BatchEntity } from "@/core/entities/batch.entity";
import { UserRole } from "@/core/enums/user-role.enum";
import { PaginationInput } from "@/core/inputs/pagination.input";
import { Auth } from "@/modules/auth/decorators/auth-context.decorator";
import { CreateOrganizationInput } from "./dto/create-organization.input";
import { FilterOrganizationInput } from "./dto/filter-organization.input";
import { SortOrganizationInput } from "./dto/sort-organization.input";
import { UpdateOrganizationInput } from "./dto/update-organization.input";
import {
  OrganizationEntity,
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
      type: () => FilterOrganizationInput,
      nullable: true,
    })
    organizationFilters?: FilterOrganizationInput
  ) {
    return this.organizationsService.findOne(ctx, {
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
      type: () => FilterOrganizationInput,
      nullable: true,
    })
    organizationFilters?: FilterOrganizationInput,
    @Args("organizationPagination", {
      type: () => PaginationInput,
      nullable: true,
    })
    organizationPagination?: PaginationInput,
    @Args("organizationSort", {
      type: () => SortOrganizationInput,
      nullable: true,
    })
    organizationSort?: SortOrganizationInput
  ) {
    return this.organizationsService.findMany(ctx, {
      filters: organizationFilters,
      sort: organizationSort,
      limit: organizationPagination?.limit,
      skip: organizationPagination?.skip,
    });
  }

  @Query(() => PaginatedOrganizationEntity)
  findManyActiveOrganizations(
    @Auth() ctx: AuthContext,
    @Args("organizationFilters", {
      type: () => FilterOrganizationInput,
      nullable: true,
    })
    organizationFilters?: FilterOrganizationInput,
    @Args("organizationPagination", {
      type: () => PaginationInput,
      nullable: true,
    })
    organizationPagination?: PaginationInput,
    @Args("organizationSort", {
      type: () => SortOrganizationInput,
      nullable: true,
    })
    organizationSort?: SortOrganizationInput
  ) {
    return this.organizationsService.findManyActive(ctx, {
      filters: organizationFilters,
      sort: organizationSort,
      limit: organizationPagination?.limit,
      skip: organizationPagination?.skip,
    });
  }

  // MUTATIONS

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => OrganizationEntity)
  createOneOrganization(
    @Auth() ctx: AuthContext,
    @Args("createOrganizationInput", { type: () => CreateOrganizationInput })
    createOrganizationInput: CreateOrganizationInput
  ) {
    return this.organizationsService.createOne(ctx, createOrganizationInput);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => BatchEntity)
  createManyOrganizations(
    @Auth() ctx: AuthContext,
    @Args("createOrganizationInputs", { type: () => [CreateOrganizationInput] })
    createOrganizationInputs: CreateOrganizationInput[]
  ) {
    return this.organizationsService.createMany(ctx, createOrganizationInputs);
  }

  @Roles(UserRole.SUPER_ADMIN)
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

  @Roles(UserRole.SUPER_ADMIN)
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

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => OrganizationEntity)
  removeOneOrganization(
    @Auth() ctx: AuthContext,
    @Args("organizationId", { type: () => ID }) organizationId: string
  ) {
    return this.organizationsService.removeOne(ctx, organizationId);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => BatchEntity)
  removeManyOrganizations(
    @Auth() ctx: AuthContext,
    @Args("organizationIds", { type: () => [ID] }) organizationIds: string[]
  ) {
    return this.organizationsService.removeMany(ctx, organizationIds);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => OrganizationEntity)
  disableOneOrganization(
    @Auth() ctx: AuthContext,
    @Args("organizationId", { type: () => ID }) organizationId: string
  ) {
    return this.organizationsService.disableOne(ctx, organizationId);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => BatchEntity)
  disableManyOrganizations(
    @Auth() ctx: AuthContext,
    @Args("organizationIds", { type: () => [ID] }) organizationIds: string[]
  ) {
    return this.organizationsService.disableMany(ctx, organizationIds);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => OrganizationEntity)
  enableOneOrganization(
    @Auth() ctx: AuthContext,
    @Args("organizationId", { type: () => ID }) organizationId: string
  ) {
    return this.organizationsService.enableOne(ctx, organizationId);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => BatchEntity)
  enableManyOrganizations(
    @Auth() ctx: AuthContext,
    @Args("organizationIds", { type: () => [ID] }) organizationIds: string[]
  ) {
    return this.organizationsService.enableMany(ctx, organizationIds);
  }
}
