import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CrudRepository } from "@/core/persistence/repositories/crud/crud.repository";
import { StatsRepository } from "@/core/persistence/repositories/stats/stats.repository";
import type { SkillEntity } from "./entities/skill.entity";
import { SkillMapper } from "./mappers/skill.mapper";
import { SkillModel } from "./schemas/skill.schema";

@Injectable()
export class SkillsRepository {
  readonly crud: CrudRepository<SkillModel, SkillEntity>;
  readonly stats: StatsRepository<SkillModel>;

  constructor(@InjectModel(SkillModel.name) model: Model<SkillModel>) {
    this.crud = new CrudRepository(model, new SkillMapper());
    this.stats = new StatsRepository(model);
  }
}
