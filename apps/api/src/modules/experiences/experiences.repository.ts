import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CrudRepository } from "@/core/persistence/repositories/crud.repository";
import { StatsRepository } from "@/core/persistence/repositories/stats.repository";
import { TenantScopedRepository } from "@/core/persistence/repositories/tenant-scoped.repository";
import { ExperienceModel } from "./schemas/experience.schema";

@Injectable()
export class ExperiencesRepository extends CrudRepository<ExperienceModel> {
  readonly stats: StatsRepository<ExperienceModel>;
  readonly tenant: TenantScopedRepository<ExperienceModel>;

  constructor(
    @InjectModel(ExperienceModel.name) experienceModel: Model<ExperienceModel>
  ) {
    super(experienceModel);
    this.stats = new StatsRepository(experienceModel);
    this.tenant = new TenantScopedRepository(this);
  }
}
