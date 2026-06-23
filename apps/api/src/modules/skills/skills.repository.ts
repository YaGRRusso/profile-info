import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CrudRepository } from "@/core/persistence/repositories/crud.repository";
import { StatsRepository } from "@/core/persistence/repositories/stats.repository";
import { SkillModel } from "./schemas/skill.schema";

@Injectable()
export class SkillsRepository extends CrudRepository<SkillModel> {
  readonly stats: StatsRepository<SkillModel>;

  constructor(@InjectModel(SkillModel.name) skillModel: Model<SkillModel>) {
    super(skillModel);
    this.stats = new StatsRepository(skillModel);
  }
}
