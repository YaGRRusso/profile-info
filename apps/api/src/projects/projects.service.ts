import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { isNil } from "lodash";
import {
  AnyKeys,
  isValidObjectId,
  Model,
  QueryFilter,
  SortOrder,
  UpdateQuery,
} from "mongoose";
import { BatchEntity } from "@/core/entities/batch.entity";
import { clearObject } from "@/core/helpers/object.helper";
import { PaginatedModel } from "@/core/schemas/paginated.schema";
import { ProjectModel } from "@/schemas/project.schema";
import { CreateProjectInput } from "./dto/create-project.input";
import { UpdateProjectInput } from "./dto/update-project.input";

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(ProjectModel.name) readonly projectModel: Model<ProjectModel>
  ) {}

  async findOneById(id: string): Promise<ProjectModel> {
    if (!isValidObjectId(id)) throw new BadRequestException("Invalid ID");

    const res = await this.projectModel.findById(id).exec();

    if (isNil(res)) throw new NotFoundException("Not Found");
    return res;
  }

  async findOne({
    filters,
  }: {
    filters?: QueryFilter<ProjectModel>;
  }): Promise<ProjectModel> {
    const res = await this.projectModel
      .findOne(clearObject(filters) as QueryFilter<ProjectModel>)
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Found");
    return res;
  }

  async findManyById(ids: string[]): Promise<ProjectModel[]> {
    if (ids.some((id) => !isValidObjectId(id)))
      throw new BadRequestException("Invalid ID");

    const res = await this.projectModel
      .find({ _id: { $in: ids } } as QueryFilter<ProjectModel>)
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Found");
    return res;
  }

  async findMany({
    filters,
    sort,
    skip = 0,
    limit = 50,
  }: {
    filters?: QueryFilter<ProjectModel>;
    sort?: Partial<Record<keyof ProjectModel, SortOrder>>;
    limit?: number;
    skip?: number;
  }): Promise<PaginatedModel<ProjectModel>> {
    const nodes = await this.projectModel
      .find(clearObject(filters) as QueryFilter<ProjectModel>)
      .sort(clearObject(sort) as Record<keyof ProjectModel, SortOrder>)
      .skip(skip)
      .limit(limit)
      .exec();

    const found = await this.projectModel
      .countDocuments(clearObject(filters) as QueryFilter<ProjectModel>)
      .exec();

    if (isNil(nodes) || isNil(found)) throw new NotFoundException("Not Found");
    return {
      nodes,
      found,
    };
  }

  async createOne(createInput: CreateProjectInput): Promise<ProjectModel> {
    const res = await this.projectModel.create(
      createInput as AnyKeys<ProjectModel>
    );

    if (isNil(res)) throw new BadRequestException("Not Created");
    return res;
  }

  async createMany(
    createInputs: CreateProjectInput[]
  ): Promise<ProjectModel[]> {
    const res = await this.projectModel.create(
      createInputs as AnyKeys<ProjectModel>[]
    );

    if (isNil(res)) throw new BadRequestException("Not Created");
    return res;
  }

  async updateOne(
    id: string,
    updateInput: UpdateProjectInput
  ): Promise<ProjectModel> {
    if (!isValidObjectId(id)) throw new BadRequestException("Invalid ID");

    const res = await this.projectModel
      .findByIdAndUpdate(id, updateInput as object as UpdateQuery<ProjectModel>)
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Updated");
    return res;
  }

  async updateMany(
    ids: string[],
    updateInput: UpdateProjectInput
  ): Promise<BatchEntity> {
    if (ids.some((id) => !isValidObjectId(id)))
      throw new BadRequestException("Invalid ID");

    const res = await this.projectModel
      .updateMany(
        { _id: { $in: ids } } as QueryFilter<ProjectModel>,
        updateInput as object as UpdateQuery<ProjectModel>
      )
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Updated");
    return { count: res.modifiedCount };
  }

  async removeOne(id: string): Promise<ProjectModel> {
    if (!isValidObjectId(id)) throw new BadRequestException("Invalid ID");

    const res = await this.projectModel.findByIdAndDelete(id).exec();

    if (isNil(res)) throw new NotFoundException("Not Removed");
    return res;
  }

  async removeMany(ids: string[]): Promise<BatchEntity> {
    if (ids.some((id) => !isValidObjectId(id)))
      throw new BadRequestException("Invalid ID");

    const res = await this.projectModel
      .deleteMany({ _id: { $in: ids } } as QueryFilter<ProjectModel>)
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Removed");
    return { count: res.deletedCount };
  }
}
