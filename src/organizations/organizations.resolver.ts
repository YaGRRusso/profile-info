import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Public } from "@/core/decorators/public-route.decorator";
import { PaginationInput } from "@/core/inputs/pagination.input";
import { CreateOrganizationInput } from "./dto/create-organization.input";
import { FilterOrganizationInput } from "./dto/filter-organization.input";
import { UpdateOrganizationInput } from "./dto/update-organization.input";
import { OrganizationEntity } from "./entities/organization.entity";
import { OrganizationsService } from "./organizations.service";

@Resolver(() => OrganizationEntity)
export class OrganizationsResolver {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Mutation(() => [OrganizationEntity])
  createOrganization(
    @Args("createOrganizationInput", { type: () => [CreateOrganizationInput] })
    createOrganizationInput: CreateOrganizationInput[]
  ) {
    return this.organizationsService.create(createOrganizationInput);
  }

  @Public()
  @Query(() => [OrganizationEntity])
  findAllOrganizations(
    @Args("filters", { nullable: true }) filters?: FilterOrganizationInput,
    @Args("pagination", { nullable: true }) pagination?: PaginationInput
  ) {
    return this.organizationsService.findAll({
      filters,
      ...pagination,
    });
  }

  @Public()
  @Query(() => OrganizationEntity)
  findOneOrganizationById(@Args("id", { type: () => ID }) id: string) {
    return this.organizationsService.findOneById(id);
  }

  @Mutation(() => OrganizationEntity)
  updateOrganization(
    @Args("updateOrganizationInput")
    updateOrganizationInput: UpdateOrganizationInput
  ) {
    return this.organizationsService.update(
      updateOrganizationInput.id,
      updateOrganizationInput
    );
  }

  @Mutation(() => [OrganizationEntity])
  removeOrganization(@Args("id", { type: () => ID }) id: string[]) {
    return this.organizationsService.remove(id);
  }
}
