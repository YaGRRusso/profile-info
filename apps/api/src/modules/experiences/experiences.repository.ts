import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CrudRepository } from "@/core/persistence/repositories/crud.repository";
import { StatsRepository } from "@/core/persistence/repositories/stats.repository";
import type { ExperienceEntity } from "./entities/experience.entity";
import { toExperienceEntity } from "./mappers/experience.mapper";
import { ExperienceModel } from "./schemas/experience.schema";

@Injectable()
export class ExperiencesRepository {
  readonly crud: CrudRepository<ExperienceModel, ExperienceEntity>;
  readonly stats: StatsRepository<ExperienceModel>;

  constructor(
    @InjectModel(ExperienceModel.name) model: Model<ExperienceModel>
  ) {
    this.crud = new CrudRepository(model, toExperienceEntity);
    this.stats = new StatsRepository(model);
  }
}
