import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { MongooseCrudRepository } from "@/core/persistence/mongoose-crud.repository";
import { SkillModel } from "./schemas/skill.schema";

@Injectable()
export class SkillsRepository extends MongooseCrudRepository<SkillModel> {
  constructor(@InjectModel(SkillModel.name) skillModel: Model<SkillModel>) {
    super(skillModel);
  }
}
