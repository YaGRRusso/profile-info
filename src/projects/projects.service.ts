import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { isNil } from "lodash";
import { Model, QueryFilter } from "mongoose";
import { BatchEntity } from "@/core/entities/batch.entity";
import { clearObject } from "@/core/helpers/object.helper";
import { Search } from "@/core/interfaces/search.interface";
import { ProjectModel } from "@/schemas/project.schema";
import { CreateProjectInput } from "./dto/create-project.input";
import { UpdateProjectInput } from "./dto/update-project.input";

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(ProjectModel.name)
    private readonly projectModel: Model<ProjectModel>
  ) {}

  // QUERIES

  async findOneById(id: string): Promise<ProjectModel> {
    const res = await this.projectModel.findById(id).exec();

    if (isNil(res)) throw new NotFoundException("Not Found");
    return res;
  }

  async findOne(filters?: QueryFilter<ProjectModel>): Promise<ProjectModel> {
    const res = await this.projectModel.findOne(clearObject(filters)).exec();

    if (isNil(res)) throw new NotFoundException("Not Found");
    return res;
  }

  async findManyById(ids: string[]): Promise<ProjectModel[]> {
    const res = await this.projectModel.find({ _id: { $in: ids } }).exec();

    if (isNil(res)) throw new NotFoundException("Not Found");
    return res;
  }

  async findMany({
    filters,
    sort,
    skip = 0,
    limit = 10,
  }: Search<ProjectModel>): Promise<ProjectModel[]> {
    const res = await this.projectModel
      .find(clearObject(filters))
      .sort({ isFeatured: -1, updatedAt: -1, ...clearObject(sort) })
      .skip(skip)
      .limit(limit)
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Found");
    return res;
  }

  // MUTATIONS

  async createOne(
    createProjectInput: CreateProjectInput
  ): Promise<ProjectModel> {
    const res = await this.projectModel.create(createProjectInput);

    if (isNil(res)) throw new BadRequestException("Not Created");
    return res;
  }

  async createMany(
    createProjectInputs: CreateProjectInput[]
  ): Promise<ProjectModel[]> {
    const res = await this.projectModel.create(createProjectInputs);

    if (isNil(res)) throw new BadRequestException("Not Created");
    return res;
  }

  async updateOne(
    id: string,
    updateProjectInput: UpdateProjectInput
  ): Promise<ProjectModel> {
    const res = await this.projectModel
      .findByIdAndUpdate(id, updateProjectInput)
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Updated");
    return res;
  }

  async updateMany(
    ids: string[],
    updateProjectInput: UpdateProjectInput
  ): Promise<BatchEntity> {
    const res = await this.projectModel
      .updateMany({ _id: { $in: ids } }, updateProjectInput)
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Updated");
    return { count: res.modifiedCount };
  }

  async removeOne(id: string): Promise<ProjectModel> {
    const res = await this.projectModel.findByIdAndDelete(id).exec();

    if (isNil(res)) throw new NotFoundException("Not Removed");
    return res;
  }

  async removeMany(ids: string[]): Promise<BatchEntity> {
    const res = await this.projectModel
      .deleteMany({ _id: { $in: ids } })
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Removed");
    return { count: res.deletedCount };
  }
}
