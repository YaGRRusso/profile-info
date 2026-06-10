import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { AnyKeys, QueryFilter, SortOrder, UpdateQuery } from "mongoose";
import { BatchEntity } from "@/core/entities/batch.entity";
import { DomainEvents } from "@/core/events/domain-events";
import { SkillDeletedEvent } from "@/core/events/skill-deleted.event";
import { PaginatedModel } from "@/core/schemas/paginated.schema";
import { SkillModel } from "@/modules/skills/schemas/skill.schema";
import { CreateSkillInput } from "./dto/create-skill.input";
import { UpdateSkillInput } from "./dto/update-skill.input";
import { SkillsRepository } from "./skills.repository";

@Injectable()
export class SkillsService {
  constructor(
    private readonly repository: SkillsRepository,
    private readonly eventEmitter: EventEmitter2
  ) {}

  findOneById(id: string): Promise<SkillModel> {
    return this.repository.findOneById(id);
  }

  findOne({
    filters,
  }: {
    filters?: QueryFilter<SkillModel>;
  }): Promise<SkillModel> {
    return this.repository.findOne({ filters });
  }

  findManyById(ids: string[]): Promise<SkillModel[]> {
    return this.repository.findManyById(ids);
  }

  findMany({
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
    return this.repository.findMany({ filters, sort, skip, limit });
  }

  createOne(createInput: CreateSkillInput): Promise<SkillModel> {
    return this.repository.createOne(createInput as AnyKeys<SkillModel>);
  }

  createMany(createInputs: CreateSkillInput[]): Promise<SkillModel[]> {
    return this.repository.createMany(createInputs as AnyKeys<SkillModel>[]);
  }

  updateOne(id: string, updateInput: UpdateSkillInput): Promise<SkillModel> {
    return this.repository.updateOne(
      id,
      updateInput as object as UpdateQuery<SkillModel>
    );
  }

  updateMany(
    ids: string[],
    updateInput: UpdateSkillInput
  ): Promise<BatchEntity> {
    return this.repository.updateMany(
      ids,
      updateInput as object as UpdateQuery<SkillModel>
    );
  }

  async removeOne(id: string): Promise<SkillModel> {
    const skill = await this.repository.findOneById(id);

    await this.eventEmitter.emitAsync(
      DomainEvents.skill.deleted,
      new SkillDeletedEvent(skill._id.toString())
    );

    await this.repository.deleteOne(id);
    return skill;
  }

  async removeMany(ids: string[]): Promise<BatchEntity> {
    const skills = await this.repository.findManyById(ids);

    for (const skill of skills) {
      await this.eventEmitter.emitAsync(
        DomainEvents.skill.deleted,
        new SkillDeletedEvent(skill._id.toString())
      );
    }

    return this.repository.deleteMany(ids);
  }

  count(): Promise<number> {
    return this.repository.count();
  }

  countByField(field: string): Promise<{ label: string; value: number }[]> {
    return this.repository.countByField(field);
  }
}
