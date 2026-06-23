import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CrudRepository } from "@/core/persistence/repositories/crud.repository";
import { StatsRepository } from "@/core/persistence/repositories/stats.repository";
import { ProjectModel } from "./schemas/project.schema";

@Injectable()
export class ProjectsRepository extends CrudRepository<ProjectModel> {
  readonly stats: StatsRepository<ProjectModel>;

  constructor(
    @InjectModel(ProjectModel.name) projectModel: Model<ProjectModel>
  ) {
    super(projectModel);
    this.stats = new StatsRepository(projectModel);
  }
}
