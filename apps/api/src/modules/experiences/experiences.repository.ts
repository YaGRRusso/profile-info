import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CrudRepository } from "@/core/persistence/repositories/crud.repository";
import { TenantScopedCrudRepository } from "@/core/persistence/repositories/tenant-scoped-crud.repository";
import { TenantScopedStatsRepository } from "@/core/persistence/repositories/tenant-scoped-stats.repository";
import { ExperienceModel } from "./schemas/experience.schema";

@Injectable()
export class ExperiencesRepository extends CrudRepository<ExperienceModel> {
  readonly tenantStats: TenantScopedStatsRepository<ExperienceModel>;
  readonly tenant: TenantScopedCrudRepository<ExperienceModel>;

  constructor(
    @InjectModel(ExperienceModel.name) experienceModel: Model<ExperienceModel>
  ) {
    super(experienceModel);
    this.tenantStats = new TenantScopedStatsRepository(experienceModel);
    this.tenant = new TenantScopedCrudRepository(this);
  }
}
