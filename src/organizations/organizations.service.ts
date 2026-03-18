import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseService } from "@/core/services/base.service";
import { OrganizationModel } from "@/schemas/organization.schema";
import { CreateOrganizationInput } from "./dto/create-organization.input";
import { UpdateOrganizationInput } from "./dto/update-organization.input";
import { OrganizationEntity } from "./entities/organization.entity";

@Injectable()
export class OrganizationsService extends BaseService<
  OrganizationModel,
  OrganizationEntity,
  CreateOrganizationInput,
  UpdateOrganizationInput
> {
  constructor(
    @InjectModel(OrganizationModel.name)
    readonly organizationModel: Model<OrganizationModel>
  ) {
    super(organizationModel);
  }
}
