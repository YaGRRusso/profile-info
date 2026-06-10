import { Injectable } from "@nestjs/common";
import { AnyKeys, QueryFilter, SortOrder, UpdateQuery } from "mongoose";
import { BatchEntity } from "@/core/entities/batch.entity";
import { PaginatedModel } from "@/core/schemas/paginated.schema";
import { ExperienceModel } from "@/modules/experiences/schemas/experience.schema";
import { CreateExperienceInput } from "./dto/create-experience.input";
import { UpdateExperienceInput } from "./dto/update-experience.input";
import { ExperiencesRepository } from "./experiences.repository";

@Injectable()
export class ExperiencesService {
  constructor(private readonly repository: ExperiencesRepository) {}

  findOneById(id: string): Promise<ExperienceModel> {
    return this.repository.findOneById(id);
  }

  findOne({
    filters,
  }: {
    filters?: QueryFilter<ExperienceModel>;
  }): Promise<ExperienceModel> {
    return this.repository.findOne({ filters });
  }

  findManyById(ids: string[]): Promise<ExperienceModel[]> {
    return this.repository.findManyById(ids);
  }

  findMany({
    filters,
    sort,
    skip = 0,
    limit = 50,
  }: {
    filters?: QueryFilter<ExperienceModel>;
    sort?: Partial<Record<keyof ExperienceModel, SortOrder>>;
    limit?: number;
    skip?: number;
  }): Promise<PaginatedModel<ExperienceModel>> {
    return this.repository.findMany({ filters, sort, skip, limit });
  }

  createOne(createInput: CreateExperienceInput): Promise<ExperienceModel> {
    return this.repository.createOne(createInput as AnyKeys<ExperienceModel>);
  }

  createMany(
    createInputs: CreateExperienceInput[]
  ): Promise<ExperienceModel[]> {
    return this.repository.createMany(
      createInputs as AnyKeys<ExperienceModel>[]
    );
  }

  updateOne(
    id: string,
    updateInput: UpdateExperienceInput
  ): Promise<ExperienceModel> {
    return this.repository.updateOne(
      id,
      updateInput as object as UpdateQuery<ExperienceModel>
    );
  }

  updateMany(
    ids: string[],
    updateInput: UpdateExperienceInput
  ): Promise<BatchEntity> {
    return this.repository.updateMany(
      ids,
      updateInput as object as UpdateQuery<ExperienceModel>
    );
  }

  removeOne(id: string): Promise<ExperienceModel> {
    return this.repository.deleteOne(id);
  }

  removeMany(ids: string[]): Promise<BatchEntity> {
    return this.repository.deleteMany(ids);
  }

  count(): Promise<number> {
    return this.repository.count();
  }

  countByField(field: string): Promise<{ label: string; value: number }[]> {
    return this.repository.countByField(field);
  }

  detachSkill(skillId: string): Promise<void> {
    return this.repository.updateManyByFilter(
      { "roles.skills": skillId },
      { $pull: { "roles.$[roleElem].skills": skillId } },
      { arrayFilters: [{ "roleElem.skills": skillId }] }
    );
  }

  purgeByOrganization(organizationId: string): Promise<void> {
    return this.repository.deleteManyByFilter({ organization: organizationId });
  }
}
