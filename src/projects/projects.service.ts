import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ProjectModel } from "@/schemas/project.schema";
import { CreateProjectInput } from "./dto/create-project.input";
import { UpdateProjectInput } from "./dto/update-project.input";

@Injectable()
export class ProjectsService {
  constructor(@InjectModel(ProjectModel.name) private readonly projectModel: Model<ProjectModel>) {}

  create(createProjectInput: CreateProjectInput) {
    return this.projectModel.create(createProjectInput);
  }

  findAll() {
    return this.projectModel.find().exec();
  }

  findOne(id: string) {
    return this.projectModel.findById(id).exec();
  }

  update(id: string, updateProjectInput: UpdateProjectInput) {
    return this.projectModel.findByIdAndUpdate(id, updateProjectInput).exec();
  }

  remove(id: string) {
    return this.projectModel.findByIdAndDelete(id).exec();
  }
}
