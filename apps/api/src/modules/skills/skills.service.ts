import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { AnyKeys, QueryFilter, SortOrder, UpdateQuery } from "mongoose";
import { RecentActivityRecord } from "@/common/helpers/recent-activity.helper";
import { BatchEntity } from "@/core/entities/batch.entity";
import { DomainEvents } from "@/core/events/domain-events";
import { SkillDeletedEvent } from "@/core/events/skill-deleted.event";
import { PaginatedModel } from "@/core/schemas/paginated.schema";
import { CreateSkillInput } from "./dto/create-skill.input";
import { UpdateSkillInput } from "./dto/update-skill.input";
import { SkillEntity } from "./entities/skill.entity";
import { SkillModel } from "./schemas/skill.schema";
import { SkillsRepository } from "./skills.repository";

@Injectable()
export class SkillsService {
  constructor(
    private readonly repository: SkillsRepository,
    private readonly eventEmitter: EventEmitter2
  ) {}

  findOneById(id: string): Promise<SkillEntity> {
    return this.repository.crud.findOneById(id);
  }

  findOne({
    filters,
  }: {
    filters?: QueryFilter<SkillModel>;
  }): Promise<SkillEntity> {
    return this.repository.crud.findOne({ filters });
  }

  findManyById(ids: string[]): Promise<SkillEntity[]> {
    return this.repository.crud.findManyById(ids);
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
  }): Promise<PaginatedModel<SkillEntity>> {
    return this.repository.crud.findMany({ filters, sort, skip, limit });
  }

  createOne(createInput: CreateSkillInput): Promise<SkillEntity> {
    return this.repository.crud.createOne(createInput as AnyKeys<SkillModel>);
  }

  createMany(createInputs: CreateSkillInput[]): Promise<BatchEntity> {
    return this.repository.crud.createMany(
      createInputs as AnyKeys<SkillModel>[]
    );
  }

  updateOne(id: string, updateInput: UpdateSkillInput): Promise<SkillEntity> {
    return this.repository.crud.updateOneById(
      id,
      updateInput as object as UpdateQuery<SkillModel>
    );
  }

  updateMany(
    ids: string[],
    updateInput: UpdateSkillInput
  ): Promise<BatchEntity> {
    return this.repository.crud.updateManyById(
      ids,
      updateInput as object as UpdateQuery<SkillModel>
    );
  }

  async removeOne(id: string): Promise<SkillEntity> {
    const skill = await this.repository.crud.findOneById(id);

    await this.eventEmitter.emitAsync(
      DomainEvents.skill.deleted,
      new SkillDeletedEvent(skill.id)
    );

    await this.repository.crud.deleteOneById(id);
    return skill;
  }

  async removeMany(ids: string[]): Promise<BatchEntity> {
    const skills = await this.repository.crud.findManyById(ids);

    for (const skill of skills) {
      await this.eventEmitter.emitAsync(
        DomainEvents.skill.deleted,
        new SkillDeletedEvent(skill.id)
      );
    }

    return this.repository.crud.deleteManyById(ids);
  }

  count(): Promise<number> {
    return this.repository.stats.count();
  }

  countByField(field: string): Promise<{ label: string; value: number }[]> {
    return this.repository.stats.countByField(field);
  }

  async findRecentActivity(limit: number): Promise<RecentActivityRecord[]> {
    const rows = await this.repository.stats.findRecentlyUpdated(
      limit,
      "name updatedAt"
    );
    return rows.map((row) => ({
      label: row.name as string,
      updatedAt: row.updatedAt,
    }));
  }
}
