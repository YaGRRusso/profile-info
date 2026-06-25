import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CrudRepository } from "@/core/persistence/repositories/crud.repository";
import { TenantScopedCrudRepository } from "@/core/persistence/repositories/tenant-scoped-crud.repository";
import { TenantScopedStatsRepository } from "@/core/persistence/repositories/tenant-scoped-stats.repository";
import type { EducationEntity } from "./entities/education.entity";
import { toEducationEntity } from "./mappers/education.mapper";
import { EducationModel } from "./schemas/education.schema";

@Injectable()
export class EducationsRepository extends CrudRepository<
  EducationModel,
  EducationEntity
> {
  readonly tenantStats: TenantScopedStatsRepository<EducationModel>;
  readonly tenant: TenantScopedCrudRepository<EducationModel, EducationEntity>;

  constructor(@InjectModel(EducationModel.name) model: Model<EducationModel>) {
    super(model);
    this.tenantStats = new TenantScopedStatsRepository(model);
    this.tenant = new TenantScopedCrudRepository(this);
  }

  protected toEntity(model: EducationModel): EducationEntity {
    return toEducationEntity(model);
  }
}
