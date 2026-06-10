import { Injectable } from "@nestjs/common";
import { AnyKeys, QueryFilter, SortOrder, UpdateQuery } from "mongoose";
import { BatchEntity } from "@/core/entities/batch.entity";
import { PaginatedModel } from "@/core/schemas/paginated.schema";
import { EducationModel } from "@/modules/educations/schemas/education.schema";
import { CreateEducationInput } from "./dto/create-education.input";
import { UpdateEducationInput } from "./dto/update-education.input";
import { EducationsRepository } from "./educations.repository";

@Injectable()
export class EducationsService {
  constructor(private readonly repository: EducationsRepository) {}

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

  detachSkill(skillId: string): Promise<void> {
    return this.repository.updateManyByFilter(
      { skills: skillId },
      { $pull: { skills: skillId } }
    );
  }

  purgeByOrganization(organizationId: string): Promise<void> {
    return this.repository.deleteManyByFilter({ organization: organizationId });
  }
}
