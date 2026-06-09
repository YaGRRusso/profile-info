import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { InjectModel } from "@nestjs/mongoose";
import { isNil } from "lodash";
import { AnyKeys, Model, QueryFilter, SortOrder, UpdateQuery } from "mongoose";
import { clearObject } from "@/common/helpers/object.helper";
import {
  assertValidObjectId,
  assertValidObjectIds,
} from "@/common/helpers/object-id.helper";
import { BatchEntity } from "@/core/entities/batch.entity";
import { DomainEvents } from "@/core/events/domain-events";
import { SkillDeletedEvent } from "@/core/events/skill-deleted.event";
import { PaginatedModel } from "@/core/schemas/paginated.schema";
import { SkillModel } from "@/modules/skills/schemas/skill.schema";
import { CreateSkillInput } from "./dto/create-skill.input";
import { UpdateSkillInput } from "./dto/update-skill.input";

@Injectable()
export class SkillsService {
  constructor(
    @InjectModel(SkillModel.name) readonly skillModel: Model<SkillModel>,
    private readonly eventEmitter: EventEmitter2
  ) {}
  async findOneById(id: string): Promise<SkillModel> {
    assertValidObjectId(id);

    const res = await this.skillModel.findById(id).exec();

    if (isNil(res)) throw new NotFoundException("Not Found");
    return res;
  }

  async findOne({
    filters,
  }: {
    filters?: QueryFilter<SkillModel>;
  }): Promise<SkillModel> {
    const res = await this.skillModel
      .findOne(clearObject(filters) as QueryFilter<SkillModel>)
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Found");
    return res;
  }

  async findManyById(ids: string[]): Promise<SkillModel[]> {
    assertValidObjectIds(ids);

    const res = await this.skillModel
      .find({ _id: { $in: ids } } as QueryFilter<SkillModel>)
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
    filters?: QueryFilter<SkillModel>;
    sort?: Partial<Record<keyof SkillModel, SortOrder>>;
    limit?: number;
    skip?: number;
  }): Promise<PaginatedModel<SkillModel>> {
    const nodes = await this.skillModel
      .find(clearObject(filters) as QueryFilter<SkillModel>)
      .sort(clearObject(sort) as Record<keyof SkillModel, SortOrder>)
      .skip(skip)
      .limit(limit)
      .exec();

    const found = await this.skillModel
      .countDocuments(clearObject(filters) as QueryFilter<SkillModel>)
      .exec();

    if (isNil(nodes) || isNil(found)) throw new NotFoundException("Not Found");
    return {
      nodes,
      found,
    };
  }

  async createOne(createInput: CreateSkillInput): Promise<SkillModel> {
    const res = await this.skillModel.create(
      createInput as AnyKeys<SkillModel>
    );

    if (isNil(res)) throw new BadRequestException("Not Created");
    return res;
  }

  async createMany(createInputs: CreateSkillInput[]): Promise<SkillModel[]> {
    const res = await this.skillModel.create(
      createInputs as AnyKeys<SkillModel>[]
    );

    if (isNil(res)) throw new BadRequestException("Not Created");
    return res;
  }

  async updateOne(
    id: string,
    updateInput: UpdateSkillInput
  ): Promise<SkillModel> {
    assertValidObjectId(id);

    const res = await this.skillModel
      .findByIdAndUpdate(id, updateInput as object as UpdateQuery<SkillModel>)
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Updated");
    return res;
  }

  async updateMany(
    ids: string[],
    updateInput: UpdateSkillInput
  ): Promise<BatchEntity> {
    assertValidObjectIds(ids);

    const res = await this.skillModel
      .updateMany(
        { _id: { $in: ids } } as QueryFilter<SkillModel>,
        updateInput as object as UpdateQuery<SkillModel>
      )
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Updated");
    return { count: res.modifiedCount };
  }

  async removeOne(id: string): Promise<SkillModel> {
    assertValidObjectId(id);

    const res = await this.skillModel.findById(id).exec();

    if (isNil(res)) throw new NotFoundException("Not Removed");

    await this.eventEmitter.emitAsync(
      DomainEvents.skill.deleted,
      new SkillDeletedEvent(res._id.toString())
    );

    await this.skillModel.findByIdAndDelete(id).exec();
    return res;
  }

  async removeMany(ids: string[]): Promise<BatchEntity> {
    assertValidObjectIds(ids);

    const skills = await this.skillModel
      .find({ _id: { $in: ids } } as QueryFilter<SkillModel>)
      .exec();

    for (const skill of skills) {
      await this.eventEmitter.emitAsync(
        DomainEvents.skill.deleted,
        new SkillDeletedEvent(skill._id.toString())
      );
    }

    const res = await this.skillModel
      .deleteMany({ _id: { $in: ids } } as QueryFilter<SkillModel>)
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Removed");
    return { count: res.deletedCount };
  }

  async count(): Promise<number> {
    return await this.skillModel.countDocuments().exec();
  }

  async countByField(
    field: string
  ): Promise<{ label: string; value: number }[]> {
    const rows = await this.skillModel.aggregate<{
      _id: string;
      value: number;
    }>([
      { $group: { _id: `$${field}`, value: { $sum: 1 } } },
      { $sort: { value: -1 } },
    ]);
    return rows.map((row) => ({ label: row._id, value: row.value }));
  }
}
