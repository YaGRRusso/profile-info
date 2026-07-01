import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Roles } from "@/core/decorators/roles.decorator";
import { BatchEntity } from "@/core/entities/batch.entity";
import { UserRole } from "@/core/enums/user-role.enum";
import { PaginationInput } from "@/core/inputs/pagination.input";
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
    @Args("organizationId", { type: () => ID }) organizationId: string
  ) {
    return this.organizationsService.findOneById(organizationId);
  }

  @Query(() => OrganizationEntity)
  findOneOrganization(
    @Args("organizationFilters", {
      type: () => FilterOrganizationInput,
      nullable: true,
    })
    organizationFilters?: FilterOrganizationInput
  ) {
    return this.organizationsService.findOne({ filters: organizationFilters });
  }

  @Query(() => [OrganizationEntity])
  findManyOrganizationById(
    @Args("organizationIds", { type: () => [ID] }) organizationIds: string[]
  ) {
    return this.organizationsService.findManyById(organizationIds);
  }

  @Query(() => PaginatedOrganizationEntity)
  findManyOrganizations(
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
    return this.organizationsService.findMany({
      filters: organizationFilters,
      sort: organizationSort,
      limit: organizationPagination?.limit,
      skip: organizationPagination?.skip,
    });
  }

  @Query(() => PaginatedOrganizationEntity)
  findManyActiveOrganizations(
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
    return this.organizationsService.findManyActive({
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
    @Args("createOrganizationInput", { type: () => CreateOrganizationInput })
    createOrganizationInput: CreateOrganizationInput
  ) {
    return this.organizationsService.createOne(createOrganizationInput);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => BatchEntity)
  createManyOrganizations(
    @Args("createOrganizationInputs", { type: () => [CreateOrganizationInput] })
    createOrganizationInputs: CreateOrganizationInput[]
  ) {
    return this.organizationsService.createMany(createOrganizationInputs);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => OrganizationEntity)
  updateOneOrganization(
    @Args("organizationId", { type: () => ID }) organizationId: string,
    @Args("updateOrganizationInput", { type: () => UpdateOrganizationInput })
    updateOrganizationInput: UpdateOrganizationInput
  ) {
    return this.organizationsService.updateOne(
      organizationId,
      updateOrganizationInput
    );
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => BatchEntity)
  updateManyOrganizations(
    @Args("organizationIds", { type: () => [ID] }) organizationIds: string[],
    @Args("updateOrganizationInput", { type: () => UpdateOrganizationInput })
    updateOrganizationInput: UpdateOrganizationInput
  ) {
    return this.organizationsService.updateMany(
      organizationIds,
      updateOrganizationInput
    );
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => OrganizationEntity)
  removeOneOrganization(
    @Args("organizationId", { type: () => ID }) organizationId: string
  ) {
    return this.organizationsService.removeOne(organizationId);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => BatchEntity)
  removeManyOrganizations(
    @Args("organizationIds", { type: () => [ID] }) organizationIds: string[]
  ) {
    return this.organizationsService.removeMany(organizationIds);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => OrganizationEntity)
  disableOneOrganization(
    @Args("organizationId", { type: () => ID }) organizationId: string
  ) {
    return this.organizationsService.disableOne(organizationId);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => BatchEntity)
  disableManyOrganizations(
    @Args("organizationIds", { type: () => [ID] }) organizationIds: string[]
  ) {
    return this.organizationsService.disableMany(organizationIds);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => OrganizationEntity)
  enableOneOrganization(
    @Args("organizationId", { type: () => ID }) organizationId: string
  ) {
    return this.organizationsService.enableOne(organizationId);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Mutation(() => BatchEntity)
  enableManyOrganizations(
    @Args("organizationIds", { type: () => [ID] }) organizationIds: string[]
  ) {
    return this.organizationsService.enableMany(organizationIds);
  }
}
