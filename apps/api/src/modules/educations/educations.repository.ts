import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CrudRepository } from "@/core/persistence/repositories/crud.repository";
import { EducationModel } from "./schemas/education.schema";

@Injectable()
export class EducationsRepository extends CrudRepository<EducationModel> {
  constructor(
    @InjectModel(EducationModel.name) educationModel: Model<EducationModel>
  ) {
    super(educationModel);
  }
}
