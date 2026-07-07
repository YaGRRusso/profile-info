import { Injectable, NotFoundException } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import {
  labelFromI18nTitle,
  type RecentActivityRecord,
} from "@/common/helpers/recent-activity.helper";
import { catalogPersistenceScope } from "@/core/context/auth-context.helper";
import type { AuthContext } from "@/core/context/auth-context.interface";
import { BatchEntity } from "@/core/entities/batch.entity";
import { DomainEvents } from "@/core/events/domain-events";
import { SkillDeletedEvent } from "@/core/events/skill-deleted.event";
import { PERSISTENCE_NOT_FOUND } from "@/core/persistence/persistence.messages";
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

  findOneById(ctx: AuthContext, id: string): Promise<SkillEntity> {
    return this.repository.crud
      .scoped(catalogPersistenceScope(ctx))
      .findOneById(id);
  }

  findOne(
    _ctx: AuthContext,
    { filters }: { filters?: FilterSkillInput }
  ): Promise<SkillEntity> {
    return this.repository.findOneActive({ filters });
  }

  findOneActiveById(_ctx: AuthContext, id: string): Promise<SkillEntity> {
    return this.repository.findOneActiveById(id);
  }

  findManyById(ctx: AuthContext, ids: string[]): Promise<SkillEntity[]> {
    return this.repository.crud
      .scoped(catalogPersistenceScope(ctx))
      .findManyById(ids);
  }

  async findManyActiveById(
    ctx: AuthContext,
    ids: string[]
  ): Promise<SkillEntity[]> {
    const skills = await this.findManyById(ctx, ids);

    if (skills.some((skill) => skill.disabled)) {
      throw new NotFoundException(PERSISTENCE_NOT_FOUND);
    }

    return skills;
  }

  findMany(
    _ctx: AuthContext,
    {
      filters,
      sort,
      skip = 0,
      limit = 50,
    }: {
      filters?: FilterSkillInput;
      sort?: SortSkillInput;
      limit?: number;
      skip?: number;
    }
  ): Promise<MultiPaged<SkillEntity>> {
    return this.repository.crud.findMany({ filters, sort, skip, limit });
  }

  findManyActive(
    _ctx: AuthContext,
    {
      filters,
      sort,
      skip = 0,
      limit = 50,
    }: {
      filters?: FilterSkillInput;
      sort?: SortSkillInput;
      limit?: number;
      skip?: number;
    }
  ): Promise<MultiPaged<SkillEntity>> {
    return this.repository.findManyActive({ filters, sort, skip, limit });
  }

  createOne(
    _ctx: AuthContext,
    createInput: CreateSkillInput
  ): Promise<SkillEntity> {
    return this.repository.crud.createOne(createInput);
  }

  createMany(
    _ctx: AuthContext,
    createInputs: CreateSkillInput[]
  ): Promise<BatchEntity> {
    return this.repository.crud.createMany(createInputs);
  }

  updateOne(
    _ctx: AuthContext,
    id: string,
    updateInput: UpdateSkillInput
  ): Promise<SkillEntity> {
    return this.repository.crud.updateOneById(id, updateInput);
  }

  updateMany(
    _ctx: AuthContext,
    ids: string[],
    updateInput: UpdateSkillInput
  ): Promise<BatchEntity> {
    return this.repository.crud.updateManyById(ids, updateInput);
  }

  disableOne(_ctx: AuthContext, id: string): Promise<SkillEntity> {
    return this.repository.crud.updateOneById(id, { disabled: true });
  }

  disableMany(_ctx: AuthContext, ids: string[]): Promise<BatchEntity> {
    return this.repository.crud.updateManyById(ids, { disabled: true });
  }

  enableOne(_ctx: AuthContext, id: string): Promise<SkillEntity> {
    return this.repository.crud.updateOneById(id, { disabled: false });
  }

  enableMany(_ctx: AuthContext, ids: string[]): Promise<BatchEntity> {
    return this.repository.crud.updateManyById(ids, { disabled: false });
  }

  async removeOne(_ctx: AuthContext, id: string): Promise<SkillEntity> {
    const skill = await this.repository.crud.findOneById(id);

    await this.eventEmitter.emitAsync(
      DomainEvents.skill.deleted,
      new SkillDeletedEvent(skill.id)
    );

    await this.repository.crud.deleteOneById(id);
    return skill;
  }

  async removeMany(_ctx: AuthContext, ids: string[]): Promise<BatchEntity> {
    const skills = await this.repository.crud.findManyById(ids);

    for (const skill of skills) {
      await this.eventEmitter.emitAsync(
        DomainEvents.skill.deleted,
        new SkillDeletedEvent(skill.id)
      );
    }

    return this.repository.crud.deleteManyById(ids);
  }

  count(_ctx: AuthContext): Promise<number> {
    return this.repository.countActive();
  }

  countByField(_ctx: AuthContext, field: string): Promise<FieldCount[]> {
    return this.repository.stats.countByField(field);
  }

  async findRecentActivity(
    _ctx: AuthContext,
    limit: number
  ): Promise<RecentActivityRecord[]> {
    const rows = await this.repository.findRecentlyUpdatedActive(
      limit,
      "slug i18n updatedAt"
    );
    return rows.map((row) => ({
      label: labelFromI18nTitle(
        row.slug as string,
        row.i18n as Parameters<typeof labelFromI18nTitle>[1]
      ),
      updatedAt: row.updatedAt,
    }));
  }
}
