import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CrudRepository } from "@/core/persistence/repositories/crud.repository";
import { TenantScopedCrudRepository } from "@/core/persistence/repositories/tenant-scoped-crud.repository";
import { TenantScopedStatsRepository } from "@/core/persistence/repositories/tenant-scoped-stats.repository";
import { EducationModel } from "./schemas/education.schema";

@Injectable()
export class EducationsRepository extends CrudRepository<EducationModel> {
  readonly tenantStats: TenantScopedStatsRepository<EducationModel>;
  readonly tenant: TenantScopedCrudRepository<EducationModel>;

  constructor(
    @InjectModel(EducationModel.name) educationModel: Model<EducationModel>
  ) {
    super(educationModel);
    this.tenantStats = new TenantScopedStatsRepository(educationModel);
    this.tenant = new TenantScopedCrudRepository(this);
  }
}
