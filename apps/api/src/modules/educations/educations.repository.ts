import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CrudRepository } from "@/core/persistence/repositories/crud.repository";
import { StatsRepository } from "@/core/persistence/repositories/stats.repository";
import { TenantScopedCrudRepository } from "@/core/persistence/repositories/tenant-scoped-crud.repository";
import { TenantScopedStatsRepository } from "@/core/persistence/repositories/tenant-scoped-stats.repository";
import type { EducationEntity } from "./entities/education.entity";
import { toEducationEntity } from "./mappers/education.mapper";
import { EducationModel } from "./schemas/education.schema";

@Injectable()
export class EducationsRepository {
  readonly crud: CrudRepository<EducationModel, EducationEntity>;
  readonly tenantCrud: TenantScopedCrudRepository<
    EducationModel,
    EducationEntity
  >;
  readonly stats: StatsRepository<EducationModel>;
  readonly tenantStats: TenantScopedStatsRepository<EducationModel>;

  constructor(@InjectModel(EducationModel.name) model: Model<EducationModel>) {
    this.crud = new CrudRepository(model, toEducationEntity);
    this.tenantCrud = new TenantScopedCrudRepository(this.crud);
    this.stats = new StatsRepository(model);
    this.tenantStats = new TenantScopedStatsRepository(this.stats);
  }
}
