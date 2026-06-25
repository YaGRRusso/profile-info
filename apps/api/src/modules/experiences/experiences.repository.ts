import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CrudRepository } from "@/core/persistence/repositories/crud.repository";
import { TenantScopedCrudRepository } from "@/core/persistence/repositories/tenant-scoped-crud.repository";
import { TenantScopedStatsRepository } from "@/core/persistence/repositories/tenant-scoped-stats.repository";
import type { ExperienceEntity } from "./entities/experience.entity";
import { toExperienceEntity } from "./mappers/experience.mapper";
import { ExperienceModel } from "./schemas/experience.schema";

@Injectable()
export class ExperiencesRepository extends CrudRepository<
  ExperienceModel,
  ExperienceEntity
> {
  readonly tenantStats: TenantScopedStatsRepository<ExperienceModel>;
  readonly tenant: TenantScopedCrudRepository<
    ExperienceModel,
    ExperienceEntity
  >;

  constructor(
    @InjectModel(ExperienceModel.name) model: Model<ExperienceModel>
  ) {
    super(model);
    this.tenantStats = new TenantScopedStatsRepository(model);
    this.tenant = new TenantScopedCrudRepository(this);
  }

  protected toEntity(model: ExperienceModel): ExperienceEntity {
    return toExperienceEntity(model);
  }
}
