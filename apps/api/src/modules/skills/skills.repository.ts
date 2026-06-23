import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CrudRepository } from "@/core/persistence/repositories/crud.repository";
import { SkillModel } from "./schemas/skill.schema";

@Injectable()
export class SkillsRepository extends CrudRepository<SkillModel> {
  constructor(@InjectModel(SkillModel.name) skillModel: Model<SkillModel>) {
    super(skillModel);
  }
}
