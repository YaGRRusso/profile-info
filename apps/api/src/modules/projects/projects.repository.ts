import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CrudRepository } from "@/core/persistence/repositories/crud/crud.repository";
import { StatsRepository } from "@/core/persistence/repositories/stats/stats.repository";
import type { ProjectEntity } from "./entities/project.entity";
import { toProjectEntity } from "./mappers/project.mapper";
import { ProjectModel } from "./schemas/project.schema";

@Injectable()
export class ProjectsRepository {
  readonly crud: CrudRepository<ProjectModel, ProjectEntity>;
  readonly stats: StatsRepository<ProjectModel>;

  constructor(@InjectModel(ProjectModel.name) model: Model<ProjectModel>) {
    this.crud = new CrudRepository(model, toProjectEntity);
    this.stats = new StatsRepository(model);
  }
}
