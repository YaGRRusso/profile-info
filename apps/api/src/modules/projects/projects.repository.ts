import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { MongooseCrudRepository } from "@/core/persistence/mongoose-crud.repository";
import { ProjectModel } from "./schemas/project.schema";

@Injectable()
export class ProjectsRepository extends MongooseCrudRepository<ProjectModel> {
  constructor(
    @InjectModel(ProjectModel.name) projectModel: Model<ProjectModel>
  ) {
    super(projectModel);
  }
}
