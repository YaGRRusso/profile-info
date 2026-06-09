import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Public } from "@/core/decorators/public-route.decorator";
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

  @Public()
  @Query(() => OrganizationEntity)
  findOneOrganizationById(
    @Args("organizationId", { type: () => ID }) organizationId: string
  ) {
    return this.organizationsService.findOneById(organizationId);
  }

  @Public()
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

  @Public()
  @Query(() => [OrganizationEntity])
  findManyOrganizationById(
    @Args("organizationIds", { type: () => [ID] }) organizationIds: string[]
  ) {
    return this.organizationsService.findManyById(organizationIds);
  }

  @Public()
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

  // MUTATIONS

  @Roles(UserRole.ADMIN)
  @Mutation(() => OrganizationEntity)
  createOneOrganization(
    @Args("createOrganizationInput", { type: () => CreateOrganizationInput })
    createOrganizationInput: CreateOrganizationInput
  ) {
    return this.organizationsService.createOne(createOrganizationInput);
  }

  @Roles(UserRole.ADMIN)
  @Mutation(() => [OrganizationEntity])
  createManyOrganizations(
    @Args("createOrganizationInputs", { type: () => [CreateOrganizationInput] })
    createOrganizationInputs: CreateOrganizationInput[]
  ) {
    return this.organizationsService.createMany(createOrganizationInputs);
  }

  @Roles(UserRole.ADMIN)
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

  @Roles(UserRole.ADMIN)
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

  @Roles(UserRole.ADMIN)
  @Mutation(() => OrganizationEntity)
  removeOneOrganization(
    @Args("organizationId", { type: () => ID }) organizationId: string
  ) {
    return this.organizationsService.removeOne(organizationId);
  }

  @Roles(UserRole.ADMIN)
  @Mutation(() => BatchEntity)
  removeManyOrganizations(
    @Args("organizationIds", { type: () => [ID] }) organizationIds: string[]
  ) {
    return this.organizationsService.removeMany(organizationIds);
  }
}
