import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CrudRepository } from "@/core/persistence/repositories/crud.repository";
import { StatsRepository } from "@/core/persistence/repositories/stats.repository";
import type { OrganizationEntity } from "./entities/organization.entity";
import { toOrganizationEntity } from "./mappers/organization.mapper";
import { OrganizationModel } from "./schemas/organization.schema";

@Injectable()
export class OrganizationsRepository extends CrudRepository<
  OrganizationModel,
  OrganizationEntity
> {
  readonly stats: StatsRepository<OrganizationModel>;

  constructor(
    @InjectModel(OrganizationModel.name) model: Model<OrganizationModel>
  ) {
    super(model);
    this.stats = new StatsRepository(model);
  }

  protected toEntity(model: OrganizationModel): OrganizationEntity {
    return toOrganizationEntity(model);
  }
}
