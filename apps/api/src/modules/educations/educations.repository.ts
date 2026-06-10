import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { MongooseCrudRepository } from "@/core/persistence/mongoose-crud.repository";
import { EducationModel } from "./schemas/education.schema";

@Injectable()
export class EducationsRepository extends MongooseCrudRepository<EducationModel> {
  constructor(
    @InjectModel(EducationModel.name) educationModel: Model<EducationModel>
  ) {
    super(educationModel);
  }
}
