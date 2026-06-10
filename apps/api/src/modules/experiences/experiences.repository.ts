import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { MongooseCrudRepository } from "@/core/persistence/mongoose-crud.repository";
import { ExperienceModel } from "./schemas/experience.schema";

@Injectable()
export class ExperiencesRepository extends MongooseCrudRepository<ExperienceModel> {
  constructor(
    @InjectModel(ExperienceModel.name) experienceModel: Model<ExperienceModel>
  ) {
    super(experienceModel);
  }
}
