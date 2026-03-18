import { Resolver } from "@nestjs/graphql";
import { BaseResolver } from "@/core/resolvers/base.resolver";
import { OrganizationModel } from "@/schemas/organization.schema";
import { CreateOrganizationInput } from "./dto/create-organization.input";
import { FilterOrganizationInput } from "./dto/filter-organization.input";
import { UpdateOrganizationInput } from "./dto/update-organization.input";
import { OrganizationEntity } from "./entities/organization.entity";
import { OrganizationsService } from "./organizations.service";

@Resolver(() => OrganizationEntity)
export class OrganizationsResolver extends BaseResolver<
  OrganizationModel,
  OrganizationEntity,
  CreateOrganizationInput,
  UpdateOrganizationInput,
  FilterOrganizationInput
>(
  OrganizationEntity,
  CreateOrganizationInput,
  UpdateOrganizationInput,
  FilterOrganizationInput
) {
  constructor(readonly organizationsService: OrganizationsService) {
    super(organizationsService);
  }
}
