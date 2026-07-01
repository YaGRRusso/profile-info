import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { RecentActivityRecord } from "@/common/helpers/recent-activity.helper";
import { BatchEntity } from "@/core/entities/batch.entity";
import { DomainEvents } from "@/core/events/domain-events";
import { SkillDeletedEvent } from "@/core/events/skill-deleted.event";
import type {
  FieldCount,
  MultiPaged,
} from "@/core/persistence/types/output.type";
import { CreateSkillInput } from "./dto/create-skill.input";
import { FilterSkillInput } from "./dto/filter-skill.input";
import { SortSkillInput } from "./dto/sort-skill.input";
import { UpdateSkillInput } from "./dto/update-skill.input";
import { SkillEntity } from "./entities/skill.entity";
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

  findOne({ filters }: { filters?: FilterSkillInput }): Promise<SkillEntity> {
    return this.repository.findOneActive({ filters });
  }

  findOneActiveById(id: string): Promise<SkillEntity> {
    return this.repository.findOneActiveById(id);
  }

  findManyById(ids: string[]): Promise<SkillEntity[]> {
    return this.repository.crud.findManyById(ids);
  }

  findManyActiveById(ids: string[]): Promise<SkillEntity[]> {
    return this.repository.findManyActiveById(ids);
  }

  findMany({
    filters,
    sort,
    skip = 0,
    limit = 50,
  }: {
    filters?: FilterSkillInput;
    sort?: SortSkillInput;
    limit?: number;
    skip?: number;
  }): Promise<MultiPaged<SkillEntity>> {
    return this.repository.crud.findMany({ filters, sort, skip, limit });
  }

  findManyActive({
    filters,
    sort,
    skip = 0,
    limit = 50,
  }: {
    filters?: FilterSkillInput;
    sort?: SortSkillInput;
    limit?: number;
    skip?: number;
  }): Promise<MultiPaged<SkillEntity>> {
    return this.repository.findManyActive({ filters, sort, skip, limit });
  }

  createOne(createInput: CreateSkillInput): Promise<SkillEntity> {
    return this.repository.crud.createOne(createInput);
  }

  createMany(createInputs: CreateSkillInput[]): Promise<BatchEntity> {
    return this.repository.crud.createMany(createInputs);
  }

  updateOne(id: string, updateInput: UpdateSkillInput): Promise<SkillEntity> {
    return this.repository.crud.updateOneById(id, updateInput);
  }

  updateMany(
    ids: string[],
    updateInput: UpdateSkillInput
  ): Promise<BatchEntity> {
    return this.repository.crud.updateManyById(ids, updateInput);
  }

  disableOne(id: string): Promise<SkillEntity> {
    return this.repository.crud.updateOneById(id, { disabled: true });
  }

  disableMany(ids: string[]): Promise<BatchEntity> {
    return this.repository.crud.updateManyById(ids, { disabled: true });
  }

  enableOne(id: string): Promise<SkillEntity> {
    return this.repository.crud.updateOneById(id, { disabled: false });
  }

  enableMany(ids: string[]): Promise<BatchEntity> {
    return this.repository.crud.updateManyById(ids, { disabled: false });
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
    return this.repository.countActive();
  }

  countByField(field: string): Promise<FieldCount[]> {
    return this.repository.stats.countByField(field);
  }

  async findRecentActivity(limit: number): Promise<RecentActivityRecord[]> {
    const rows = await this.repository.findRecentlyUpdatedActive(
      limit,
      "name updatedAt"
    );
    return rows.map((row) => ({
      label: row.name as string,
      updatedAt: row.updatedAt,
    }));
  }
}
