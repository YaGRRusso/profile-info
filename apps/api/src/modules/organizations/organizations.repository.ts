import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CrudRepository } from "@/core/persistence/repositories/crud.repository";
import { StatsRepository } from "@/core/persistence/repositories/stats.repository";
import { OrganizationModel } from "./schemas/organization.schema";

@Injectable()
export class OrganizationsRepository extends CrudRepository<OrganizationModel> {
  readonly stats: StatsRepository<OrganizationModel>;

  constructor(
    @InjectModel(OrganizationModel.name)
    organizationModel: Model<OrganizationModel>
  ) {
    super(organizationModel);
    this.stats = new StatsRepository(organizationModel);
  }
}
