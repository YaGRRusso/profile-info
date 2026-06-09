import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { AnyKeys, Model, QueryFilter, SortOrder, UpdateQuery } from "mongoose";
import { BatchEntity } from "@/core/entities/batch.entity";
import { MongooseCrudRepository } from "@/core/persistence/mongoose-crud.repository";
import { PaginatedModel } from "@/core/schemas/paginated.schema";
import { EducationModel } from "@/modules/educations/schemas/education.schema";
import { CreateEducationInput } from "./dto/create-education.input";
import { UpdateEducationInput } from "./dto/update-education.input";

@Injectable()
export class EducationsService {
  private readonly repository: MongooseCrudRepository<EducationModel>;

  constructor(
    @InjectModel(EducationModel.name)
    readonly educationModel: Model<EducationModel>
  ) {
    this.repository = new MongooseCrudRepository(educationModel);
  }

  findOneById(id: string): Promise<EducationModel> {
    return this.repository.findOneById(id);
  }

  findOne({
    filters,
  }: {
    filters?: QueryFilter<EducationModel>;
  }): Promise<EducationModel> {
    return this.repository.findOne({ filters });
  }

  findManyById(ids: string[]): Promise<EducationModel[]> {
    return this.repository.findManyById(ids);
  }

  findMany({
    filters,
    sort,
    skip = 0,
    limit = 50,
  }: {
    filters?: QueryFilter<EducationModel>;
    sort?: Partial<Record<keyof EducationModel, SortOrder>>;
    limit?: number;
    skip?: number;
  }): Promise<PaginatedModel<EducationModel>> {
    return this.repository.findMany({ filters, sort, skip, limit });
  }

  createOne(createInput: CreateEducationInput): Promise<EducationModel> {
    return this.repository.createOne(createInput as AnyKeys<EducationModel>);
  }

  createMany(createInputs: CreateEducationInput[]): Promise<EducationModel[]> {
    return this.repository.createMany(
      createInputs as AnyKeys<EducationModel>[]
    );
  }

  updateOne(
    id: string,
    updateInput: UpdateEducationInput
  ): Promise<EducationModel> {
    return this.repository.updateOne(
      id,
      updateInput as object as UpdateQuery<EducationModel>
    );
  }

  updateMany(
    ids: string[],
    updateInput: UpdateEducationInput
  ): Promise<BatchEntity> {
    return this.repository.updateMany(
      ids,
      updateInput as object as UpdateQuery<EducationModel>
    );
  }

  removeOne(id: string): Promise<EducationModel> {
    return this.repository.deleteOne(id);
  }

  removeMany(ids: string[]): Promise<BatchEntity> {
    return this.repository.deleteMany(ids);
  }

  count(): Promise<number> {
    return this.repository.count();
  }

  async detachSkill(skillId: string): Promise<void> {
    await this.educationModel
      .updateMany({ skills: skillId }, { $pull: { skills: skillId } })
      .exec();
  }

  async purgeByOrganization(organizationId: string): Promise<void> {
    await this.educationModel
      .deleteMany({ organization: organizationId })
      .exec();
  }
}
