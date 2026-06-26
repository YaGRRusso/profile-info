import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CrudRepository } from "@/core/persistence/repositories/crud/crud.repository";
import { StatsRepository } from "@/core/persistence/repositories/stats/stats.repository";
import type { OrganizationEntity } from "./entities/organization.entity";
import { toOrganizationEntity } from "./mappers/organization.mapper";
import { OrganizationModel } from "./schemas/organization.schema";

@Injectable()
export class OrganizationsRepository {
  readonly crud: CrudRepository<OrganizationModel, OrganizationEntity>;
  readonly stats: StatsRepository<OrganizationModel>;

  constructor(
    @InjectModel(OrganizationModel.name) model: Model<OrganizationModel>
  ) {
    this.crud = new CrudRepository(model, toOrganizationEntity);
    this.stats = new StatsRepository(model);
  }
}
