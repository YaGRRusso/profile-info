import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CrudRepository } from "@/core/persistence/repositories/crud/crud.repository";
import { StatsRepository } from "@/core/persistence/repositories/stats/stats.repository";
import { CreateProjectInput } from "./dto/create-project.input";
import { FilterProjectInput } from "./dto/filter-project.input";
import { SortProjectInput } from "./dto/sort-project.input";
import { UpdateProjectInput } from "./dto/update-project.input";
import type { ProjectEntityRecord } from "./entities/project.entity";
import { ProjectMapper } from "./mappers/project.mapper";
import { ProjectModel } from "./schemas/project.schema";

@Injectable()
export class ProjectsRepository {
  private readonly model: Model<ProjectModel>;
  readonly crud: CrudRepository<
    ProjectModel,
    ProjectEntityRecord,
    CreateProjectInput,
    UpdateProjectInput,
    FilterProjectInput,
    SortProjectInput
  >;
  readonly stats: StatsRepository<ProjectModel>;

  constructor(@InjectModel(ProjectModel.name) model: Model<ProjectModel>) {
    this.model = model;
    this.crud = new CrudRepository(model, new ProjectMapper());
    this.stats = new StatsRepository(model);
  }

  async detachSkill(skillId: string): Promise<void> {
    await this.model
      .updateMany({ skillIds: skillId }, { $pull: { skillIds: skillId } })
      .exec();
  }
}
