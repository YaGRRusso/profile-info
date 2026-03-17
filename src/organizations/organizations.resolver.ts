import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Public } from "@/core/decorators/public-route.decorator";
import { BatchEntity } from "@/core/entities/batch.entity";
import { PaginationInput } from "@/core/inputs/pagination.input";
import { CreateOrganizationInput } from "./dto/create-organization.input";
import { FilterOrganizationInput } from "./dto/filter-organization.input";
import { UpdateOrganizationInput } from "./dto/update-organization.input";
import { OrganizationEntity } from "./entities/organization.entity";
import { OrganizationsService } from "./organizations.service";

@Resolver(() => OrganizationEntity)
export class OrganizationsResolver {
  constructor(private readonly organizationsService: OrganizationsService) {}

  // QUERIES

  @Public()
  @Query(() => OrganizationEntity)
  findOneOrganizationById(@Args("id", { type: () => ID }) id: string) {
    return this.organizationsService.findOneById(id);
  }

  @Public()
  @Query(() => OrganizationEntity)
  findOneOrganization(
    @Args("filters", {
      type: () => FilterOrganizationInput,
      nullable: true,
    })
    filters?: FilterOrganizationInput
  ) {
    return this.organizationsService.findOne(filters);
  }

  @Public()
  @Query(() => [OrganizationEntity])
  findManyOrganizationById(@Args("ids", { type: () => [ID] }) ids: string[]) {
    return this.organizationsService.findManyById(ids);
  }

  @Public()
  @Query(() => [OrganizationEntity])
  findManyOrganizations(
    @Args("filters", {
      type: () => FilterOrganizationInput,
      nullable: true,
    })
    filters?: FilterOrganizationInput,
    @Args("pagination", {
      type: () => PaginationInput,
      nullable: true,
    })
    pagination?: PaginationInput
  ) {
    return this.organizationsService.findMany({
      filters,
      ...pagination,
    });
  }

  // MUTATIONS

  @Mutation(() => OrganizationEntity)
  createOneOrganization(
    @Args("createOrganizationInput", { type: () => CreateOrganizationInput })
    createOrganizationInput: CreateOrganizationInput
  ) {
    return this.organizationsService.createOne(createOrganizationInput);
  }

  @Mutation(() => [OrganizationEntity])
  createManyOrganizations(
    @Args("createOrganizationInputs", { type: () => [CreateOrganizationInput] })
    createOrganizationInputs: CreateOrganizationInput[]
  ) {
    return this.organizationsService.createMany(createOrganizationInputs);
  }

  @Mutation(() => OrganizationEntity)
  updateOneOrganization(
    @Args("id", { type: () => ID }) id: string,
    @Args("updateOrganizationInput", { type: () => UpdateOrganizationInput })
    updateOrganizationInput: UpdateOrganizationInput
  ) {
    return this.organizationsService.updateOne(id, updateOrganizationInput);
  }

  @Mutation(() => BatchEntity)
  updateManyOrganizations(
    @Args("ids", { type: () => [ID] }) ids: string[],
    @Args("updateOrganizationInput", { type: () => UpdateOrganizationInput })
    updateOrganizationInput: UpdateOrganizationInput
  ) {
    return this.organizationsService.updateMany(ids, updateOrganizationInput);
  }

  @Mutation(() => OrganizationEntity)
  removeOneOrganization(@Args("id", { type: () => ID }) id: string) {
    return this.organizationsService.removeOne(id);
  }

  @Mutation(() => BatchEntity)
  removeManyOrganizations(@Args("ids", { type: () => [ID] }) ids: string[]) {
    return this.organizationsService.removeMany(ids);
  }
}
