import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { isNil } from "lodash";
import { AnyKeys, Model, QueryFilter, SortOrder, UpdateQuery } from "mongoose";
import { clearObject } from "@/common/helpers/object.helper";
import {
  assertValidObjectId,
  assertValidObjectIds,
} from "@/common/helpers/object-id.helper";
import { BatchEntity } from "@/core/entities/batch.entity";
import { PaginatedModel } from "@/core/schemas/paginated.schema";
import { ExperienceModel } from "@/modules/experiences/schemas/experience.schema";
import { CreateExperienceInput } from "./dto/create-experience.input";
import { UpdateExperienceInput } from "./dto/update-experience.input";

@Injectable()
export class ExperiencesService {
  constructor(
    @InjectModel(ExperienceModel.name)
    readonly experienceModel: Model<ExperienceModel>
  ) {}

  async findOneById(id: string): Promise<ExperienceModel> {
    assertValidObjectId(id);

    const res = await this.experienceModel.findById(id).exec();

    if (isNil(res)) throw new NotFoundException("Not Found");
    return res;
  }

  async findOne({
    filters,
  }: {
    filters?: QueryFilter<ExperienceModel>;
  }): Promise<ExperienceModel> {
    const res = await this.experienceModel
      .findOne(clearObject(filters) as QueryFilter<ExperienceModel>)
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Found");
    return res;
  }

  async findManyById(ids: string[]): Promise<ExperienceModel[]> {
    assertValidObjectIds(ids);

    const res = await this.experienceModel
      .find({ _id: { $in: ids } } as QueryFilter<ExperienceModel>)
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
    filters?: QueryFilter<ExperienceModel>;
    sort?: Partial<Record<keyof ExperienceModel, SortOrder>>;
    limit?: number;
    skip?: number;
  }): Promise<PaginatedModel<ExperienceModel>> {
    const nodes = await this.experienceModel
      .find(clearObject(filters) as QueryFilter<ExperienceModel>)
      .sort(clearObject(sort) as Record<keyof ExperienceModel, SortOrder>)
      .skip(skip)
      .limit(limit)
      .exec();

    const found = await this.experienceModel
      .countDocuments(clearObject(filters) as QueryFilter<ExperienceModel>)
      .exec();

    if (isNil(nodes) || isNil(found)) throw new NotFoundException("Not Found");
    return {
      nodes,
      found,
    };
  }

  async createOne(
    createInput: CreateExperienceInput
  ): Promise<ExperienceModel> {
    const res = await this.experienceModel.create(
      createInput as AnyKeys<ExperienceModel>
    );

    if (isNil(res)) throw new BadRequestException("Not Created");
    return res;
  }

  async createMany(
    createInputs: CreateExperienceInput[]
  ): Promise<ExperienceModel[]> {
    const res = await this.experienceModel.create(
      createInputs as AnyKeys<ExperienceModel>[]
    );

    if (isNil(res)) throw new BadRequestException("Not Created");
    return res;
  }

  async updateOne(
    id: string,
    updateInput: UpdateExperienceInput
  ): Promise<ExperienceModel> {
    assertValidObjectId(id);

    const res = await this.experienceModel
      .findByIdAndUpdate(
        id,
        updateInput as object as UpdateQuery<ExperienceModel>
      )
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Updated");
    return res;
  }

  async updateMany(
    ids: string[],
    updateInput: UpdateExperienceInput
  ): Promise<BatchEntity> {
    assertValidObjectIds(ids);

    const res = await this.experienceModel
      .updateMany(
        { _id: { $in: ids } } as QueryFilter<ExperienceModel>,
        updateInput as object as UpdateQuery<ExperienceModel>
      )
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Updated");
    return { count: res.modifiedCount };
  }

  async removeOne(id: string): Promise<ExperienceModel> {
    assertValidObjectId(id);

    const res = await this.experienceModel.findByIdAndDelete(id).exec();

    if (isNil(res)) throw new NotFoundException("Not Removed");
    return res;
  }

  async removeMany(ids: string[]): Promise<BatchEntity> {
    assertValidObjectIds(ids);

    const res = await this.experienceModel
      .deleteMany({ _id: { $in: ids } } as QueryFilter<ExperienceModel>)
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Removed");
    return { count: res.deletedCount };
  }

  async count(): Promise<number> {
    return await this.experienceModel.countDocuments().exec();
  }

  async countByField(
    field: string
  ): Promise<{ label: string; value: number }[]> {
    const rows = await this.experienceModel.aggregate<{
      _id: string;
      value: number;
    }>([
      { $group: { _id: `$${field}`, value: { $sum: 1 } } },
      { $sort: { value: -1 } },
    ]);
    return rows.map((row) => ({ label: row._id, value: row.value }));
  }

  async detachSkill(skillId: string): Promise<void> {
    await this.experienceModel
      .updateMany(
        { "roles.skills": skillId },
        { $pull: { "roles.$[roleElem].skills": skillId } },
        { arrayFilters: [{ "roleElem.skills": skillId }] }
      )
      .exec();
  }

  async purgeByOrganization(organizationId: string): Promise<void> {
    await this.experienceModel
      .deleteMany({ organization: organizationId })
      .exec();
  }
}
