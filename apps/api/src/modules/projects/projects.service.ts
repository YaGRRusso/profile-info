import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { AnyKeys, Model, QueryFilter, SortOrder, UpdateQuery } from "mongoose";
import { BatchEntity } from "@/core/entities/batch.entity";
import { MongooseCrudRepository } from "@/core/persistence/mongoose-crud.repository";
import { PaginatedModel } from "@/core/schemas/paginated.schema";
import { ProjectModel } from "@/modules/projects/schemas/project.schema";
import { CreateProjectInput } from "./dto/create-project.input";
import { UpdateProjectInput } from "./dto/update-project.input";

@Injectable()
export class ProjectsService {
  private readonly repository: MongooseCrudRepository<ProjectModel>;

  constructor(
    @InjectModel(ProjectModel.name) readonly projectModel: Model<ProjectModel>
  ) {
    this.repository = new MongooseCrudRepository(projectModel);
  }

  findOneById(id: string): Promise<ProjectModel> {
    return this.repository.findOneById(id);
  }

  findOne({
    filters,
  }: {
    filters?: QueryFilter<ProjectModel>;
  }): Promise<ProjectModel> {
    return this.repository.findOne({ filters });
  }

  findManyById(ids: string[]): Promise<ProjectModel[]> {
    return this.repository.findManyById(ids);
  }

  findMany({
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
    return this.repository.findMany({ filters, sort, skip, limit });
  }

  createOne(createInput: CreateProjectInput): Promise<ProjectModel> {
    return this.repository.createOne(createInput as AnyKeys<ProjectModel>);
  }

  createMany(createInputs: CreateProjectInput[]): Promise<ProjectModel[]> {
    return this.repository.createMany(createInputs as AnyKeys<ProjectModel>[]);
  }

  updateOne(
    id: string,
    updateInput: UpdateProjectInput
  ): Promise<ProjectModel> {
    return this.repository.updateOne(
      id,
      updateInput as object as UpdateQuery<ProjectModel>
    );
  }

  updateMany(
    ids: string[],
    updateInput: UpdateProjectInput
  ): Promise<BatchEntity> {
    return this.repository.updateMany(
      ids,
      updateInput as object as UpdateQuery<ProjectModel>
    );
  }

  removeOne(id: string): Promise<ProjectModel> {
    return this.repository.deleteOne(id);
  }

  removeMany(ids: string[]): Promise<BatchEntity> {
    return this.repository.deleteMany(ids);
  }

  count(): Promise<number> {
    return this.repository.count();
  }

  async detachSkill(skillId: string): Promise<void> {
    await this.projectModel
      .updateMany({ skills: skillId }, { $pull: { skills: skillId } })
      .exec();
  }
}
