import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CrudRepository } from "@/core/persistence/repositories/crud.repository";
import { StatsRepository } from "@/core/persistence/repositories/stats.repository";
import type { EducationEntity } from "./entities/education.entity";
import { toEducationEntity } from "./mappers/education.mapper";
import { EducationModel } from "./schemas/education.schema";

@Injectable()
export class EducationsRepository {
  readonly crud: CrudRepository<EducationModel, EducationEntity>;
  readonly stats: StatsRepository<EducationModel>;

  constructor(@InjectModel(EducationModel.name) model: Model<EducationModel>) {
    this.crud = new CrudRepository(model, toEducationEntity);
    this.stats = new StatsRepository(model);
  }
}
