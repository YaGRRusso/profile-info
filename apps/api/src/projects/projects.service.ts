import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseService } from "@/core/services/base.service";
import { ProjectModel } from "@/schemas/project.schema";
import { CreateProjectInput } from "./dto/create-project.input";
import { UpdateProjectInput } from "./dto/update-project.input";

@Injectable()
export class ProjectsService extends BaseService<
  ProjectModel,
  CreateProjectInput,
  UpdateProjectInput
> {
  constructor(
    @InjectModel(ProjectModel.name)
    readonly projectModel: Model<ProjectModel>
  ) {
    super(projectModel);
  }
}
