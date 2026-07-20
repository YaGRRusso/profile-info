import { Injectable, NotFoundException } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import type { AuthContext } from "@/core/context/auth-context.interface";
import { BatchEntity } from "@/core/entities/batch.entity";
import { DomainEvents } from "@/core/events/domain-events";
import { SkillDeletedEvent } from "@/core/events/skill-deleted.event";
import { PERSISTENCE_NOT_FOUND } from "@/core/persistence/persistence.messages";
import type {
  FieldCount,
  MultiPaged,
  RecentActivityRecord,
} from "@/core/persistence/types/output.type";
import { CreateSkillInput } from "./dto/create-skill.input";
import { FilterSkillInput } from "./dto/filter-skill.input";
import { SortSkillInput } from "./dto/sort-skill.input";
import { UpdateSkillInput } from "./dto/update-skill.input";
import { SkillEntityRecord } from "./entities/skill.entity";
import { SkillsRepository } from "./skills.repository";

@Injectable()
export class SkillsService {
  constructor(
    private readonly repository: SkillsRepository,
    private readonly eventEmitter: EventEmitter2
  ) {}

  findOneById(ctx: AuthContext, id: string): Promise<SkillEntityRecord> {
    return this.repository.catalogCrud(ctx).findOneById(id);
  }

  findOne(
    ctx: AuthContext,
    { filters }: { filters?: FilterSkillInput }
  ): Promise<SkillEntityRecord> {
    return this.repository.catalogCrud(ctx).findOne({ filters });
  }

  findOneActive(
    ctx: AuthContext,
    { filters }: { filters?: FilterSkillInput }
  ): Promise<SkillEntityRecord> {
    return this.repository.catalogCrud(ctx).findOne({
      filters: this.withActiveFilter(filters),
    });
  }

  async findOneActiveById(
    ctx: AuthContext,
    id: string
  ): Promise<SkillEntityRecord> {
    const skill = await this.repository.catalogCrud(ctx).findOneById(id);
    this.assertActive(skill);
    return skill;
  }

  findManyById(ctx: AuthContext, ids: string[]): Promise<SkillEntityRecord[]> {
    return this.repository.catalogCrud(ctx).findManyById(ids);
  }

  async findManyActiveById(
    ctx: AuthContext,
    ids: string[]
  ): Promise<SkillEntityRecord[]> {
    const skills = await this.findManyById(ctx, ids);
    this.assertAllActive(skills);
    return skills;
  }

  findMany(
    ctx: AuthContext,
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
  ): Promise<MultiPaged<SkillEntityRecord>> {
    return this.repository
      .catalogCrud(ctx)
      .findMany({ filters, limit, skip, sort });
  }

  findManyActive(
    ctx: AuthContext,
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
  ): Promise<MultiPaged<SkillEntityRecord>> {
    return this.repository.catalogCrud(ctx).findMany({
      filters: this.withActiveFilter(filters),
      limit,
      skip,
      sort,
    });
  }

  createOne(
    ctx: AuthContext,
    createInput: CreateSkillInput
  ): Promise<SkillEntityRecord> {
    return this.repository.catalogCrud(ctx).createOne(createInput);
  }

  createMany(
    ctx: AuthContext,
    createInputs: CreateSkillInput[]
  ): Promise<BatchEntity> {
    return this.repository.catalogCrud(ctx).createMany(createInputs);
  }

  updateOne(
    ctx: AuthContext,
    id: string,
    updateInput: UpdateSkillInput
  ): Promise<SkillEntityRecord> {
    return this.repository.catalogCrud(ctx).updateOneById(id, updateInput);
  }

  updateMany(
    ctx: AuthContext,
    ids: string[],
    updateInput: UpdateSkillInput
  ): Promise<BatchEntity> {
    return this.repository.catalogCrud(ctx).updateManyById(ids, updateInput);
  }

  disableOne(ctx: AuthContext, id: string): Promise<SkillEntityRecord> {
    return this.repository
      .catalogCrud(ctx)
      .updateOneById(id, { disabled: true });
  }

  disableMany(ctx: AuthContext, ids: string[]): Promise<BatchEntity> {
    return this.repository
      .catalogCrud(ctx)
      .updateManyById(ids, { disabled: true });
  }

  enableOne(ctx: AuthContext, id: string): Promise<SkillEntityRecord> {
    return this.repository
      .catalogCrud(ctx)
      .updateOneById(id, { disabled: false });
  }

  enableMany(ctx: AuthContext, ids: string[]): Promise<BatchEntity> {
    return this.repository
      .catalogCrud(ctx)
      .updateManyById(ids, { disabled: false });
  }

  async removeOne(ctx: AuthContext, id: string): Promise<SkillEntityRecord> {
    const skill = await this.repository.catalogCrud(ctx).findOneById(id);

    await this.eventEmitter.emitAsync(
      DomainEvents.skill.deleted,
      new SkillDeletedEvent(skill.id)
    );

    await this.repository.catalogCrud(ctx).deleteOneById(id);
    return skill;
  }

  async removeMany(ctx: AuthContext, ids: string[]): Promise<BatchEntity> {
    const skills = await this.repository.catalogCrud(ctx).findManyById(ids);

    await Promise.all(
      skills.map((skill) =>
        this.eventEmitter.emitAsync(
          DomainEvents.skill.deleted,
          new SkillDeletedEvent(skill.id)
        )
      )
    );

    return this.repository.catalogCrud(ctx).deleteManyById(ids);
  }

  count(ctx: AuthContext): Promise<number> {
    return this.repository.countActive(ctx);
  }

  countOwnedLocal(ctx: AuthContext): Promise<number> {
    return this.repository.countOwnedLocalActive(ctx);
  }

  countByField(ctx: AuthContext, field: string): Promise<FieldCount[]> {
    return this.repository.countByField(ctx, field);
  }

  async findRecentActivity(
    ctx: AuthContext,
    limit: number
  ): Promise<RecentActivityRecord[]> {
    const rows = await this.repository.findRecentlyUpdatedActive(
      ctx,
      limit,
      "slug i18n updatedAt"
    );
    return rows.map((row) => ({
      i18n: (row.i18n as RecentActivityRecord["i18n"]) ?? [],
      slug: row.slug as string | undefined,
      updatedAt: row.updatedAt,
    }));
  }

  async purgeLocalByOwner(ownerId: string): Promise<void> {
    await this.repository.purgeLocalByOwner(ownerId);
  }

  private withActiveFilter(filters?: FilterSkillInput): FilterSkillInput {
    return { ...filters, disabled: false };
  }

  private assertActive(entry: { disabled: boolean }): void {
    if (entry.disabled) {
      throw new NotFoundException(PERSISTENCE_NOT_FOUND);
    }
  }

  private assertAllActive(entries: Array<{ disabled: boolean }>): void {
    if (entries.some((entry) => entry.disabled)) {
      throw new NotFoundException(PERSISTENCE_NOT_FOUND);
    }
  }
}
