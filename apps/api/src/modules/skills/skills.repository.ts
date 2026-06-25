import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CrudRepository } from "@/core/persistence/repositories/crud.repository";
import { StatsRepository } from "@/core/persistence/repositories/stats.repository";
import type { SkillEntity } from "./entities/skill.entity";
import { toSkillEntity } from "./mappers/skill.mapper";
import { SkillModel } from "./schemas/skill.schema";

@Injectable()
export class SkillsRepository extends CrudRepository<SkillModel, SkillEntity> {
  readonly stats: StatsRepository<SkillModel>;

  constructor(@InjectModel(SkillModel.name) model: Model<SkillModel>) {
    super(model);
    this.stats = new StatsRepository(model);
  }

  protected toEntity(model: SkillModel): SkillEntity {
    return toSkillEntity(model);
  }
}
