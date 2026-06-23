import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CrudRepository } from "@/core/persistence/repositories/crud.repository";
import { StatsRepository } from "@/core/persistence/repositories/stats.repository";
import { EducationModel } from "./schemas/education.schema";

@Injectable()
export class EducationsRepository extends CrudRepository<EducationModel> {
  readonly stats: StatsRepository<EducationModel>;

  constructor(
    @InjectModel(EducationModel.name) educationModel: Model<EducationModel>
  ) {
    super(educationModel);
    this.stats = new StatsRepository(educationModel);
  }
}
