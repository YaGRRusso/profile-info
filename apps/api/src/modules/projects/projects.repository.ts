import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CrudRepository } from "@/core/persistence/repositories/crud.repository";
import { TenantScopedCrudRepository } from "@/core/persistence/repositories/tenant-scoped-crud.repository";
import { TenantScopedStatsRepository } from "@/core/persistence/repositories/tenant-scoped-stats.repository";
import type { ProjectEntity } from "./entities/project.entity";
import { toProjectEntity } from "./mappers/project.mapper";
import { ProjectModel } from "./schemas/project.schema";

@Injectable()
export class ProjectsRepository extends CrudRepository<
  ProjectModel,
  ProjectEntity
> {
  readonly tenantStats: TenantScopedStatsRepository<ProjectModel>;
  readonly tenant: TenantScopedCrudRepository<ProjectModel, ProjectEntity>;

  constructor(@InjectModel(ProjectModel.name) model: Model<ProjectModel>) {
    super(model);
    this.tenantStats = new TenantScopedStatsRepository(model);
    this.tenant = new TenantScopedCrudRepository(this);
  }

  protected toEntity(model: ProjectModel): ProjectEntity {
    return toProjectEntity(model);
  }
}
