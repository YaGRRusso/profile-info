import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CrudRepository } from "@/core/persistence/repositories/crud.repository";
import { StatsRepository } from "@/core/persistence/repositories/stats.repository";
import { TenantScopedCrudRepository } from "@/core/persistence/repositories/tenant-scoped-crud.repository";
import { TenantScopedStatsRepository } from "@/core/persistence/repositories/tenant-scoped-stats.repository";
import type { ProjectEntity } from "./entities/project.entity";
import { toProjectEntity } from "./mappers/project.mapper";
import { ProjectModel } from "./schemas/project.schema";

@Injectable()
export class ProjectsRepository {
  readonly crud: CrudRepository<ProjectModel, ProjectEntity>;
  readonly tenantCrud: TenantScopedCrudRepository<ProjectModel, ProjectEntity>;
  readonly stats: StatsRepository<ProjectModel>;
  readonly tenantStats: TenantScopedStatsRepository<ProjectModel>;

  constructor(@InjectModel(ProjectModel.name) model: Model<ProjectModel>) {
    this.crud = new CrudRepository(model, toProjectEntity);
    this.tenantCrud = new TenantScopedCrudRepository(this.crud);
    this.stats = new StatsRepository(model);
    this.tenantStats = new TenantScopedStatsRepository(this.stats);
  }
}
