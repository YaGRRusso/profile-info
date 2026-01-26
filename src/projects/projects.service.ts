import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ProjectModel } from "@/schemas/project.schema";
import { CreateProjectInput } from "./dto/create-project.input";
import { UpdateProjectInput } from "./dto/update-project.input";

@Injectable()
export class ProjectsService {
  constructor(@InjectModel(ProjectModel.name) private readonly projectModel: Model<ProjectModel>) {}

  async create(createProjectInput: CreateProjectInput[]) {
    return await Promise.all(
      createProjectInput.map(async (item) => {
        return await this.projectModel.create(item as any);
      })
    );
  }

  async findAll() {
    return await this.projectModel.find().exec();
  }

  async findOneById(id: string) {
    return await this.projectModel.findById(id).exec();
  }

  async update(id: string, updateProjectInput: UpdateProjectInput) {
    return await this.projectModel.findByIdAndUpdate(id, updateProjectInput).exec();
  }

  async remove(id: string[]) {
    return await this.projectModel.deleteMany({ _id: { $in: id } }).exec();
  }
}
