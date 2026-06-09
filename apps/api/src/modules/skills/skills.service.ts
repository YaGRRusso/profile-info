import { ConflictException, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { InjectModel } from "@nestjs/mongoose";
import { AnyKeys, Model, QueryFilter, SortOrder, UpdateQuery } from "mongoose";
import { BatchEntity } from "@/core/entities/batch.entity";
import { DomainEvents } from "@/core/events/domain-events";
import { SkillCreatedEvent } from "@/core/events/skill-created.event";
import { SkillDeletedEvent } from "@/core/events/skill-deleted.event";
import { MongooseCrudRepository } from "@/core/persistence/mongoose-crud.repository";
import { PaginatedModel } from "@/core/schemas/paginated.schema";
import { SkillModel } from "@/modules/skills/schemas/skill.schema";
import { CreateSkillInput } from "./dto/create-skill.input";
import { UpdateSkillInput } from "./dto/update-skill.input";

@Injectable()
export class SkillsService {
  private readonly repository: MongooseCrudRepository<SkillModel>;

  constructor(
    @InjectModel(SkillModel.name) readonly skillModel: Model<SkillModel>,
    private readonly eventEmitter: EventEmitter2
  ) {
    this.repository = new MongooseCrudRepository(skillModel);
  }

  // --- Queries (no business logic, pure delegation) ---

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

  // --- Commands (business rules enforced here) ---

  async createOne(createInput: CreateSkillInput): Promise<SkillModel> {
    await this.assertSlugIsUnique(createInput.slug);

    const skill = await this.repository.createOne(
      createInput as AnyKeys<SkillModel>
    );

    await this.eventEmitter.emitAsync(
      DomainEvents.skill.created,
      new SkillCreatedEvent(skill._id.toString(), skill.slug)
    );

    return skill;
  }

  async createMany(createInputs: CreateSkillInput[]): Promise<SkillModel[]> {
    for (const input of createInputs) {
      await this.assertSlugIsUnique(input.slug);
    }
    return this.repository.createMany(createInputs as AnyKeys<SkillModel>[]);
  }

  async updateOne(
    id: string,
    updateInput: UpdateSkillInput
  ): Promise<SkillModel> {
    if (updateInput.slug) {
      await this.assertSlugIsUnique(updateInput.slug, id);
    }
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

  // --- Aggregation (used by Dashboard) ---

  count(): Promise<number> {
    return this.repository.count();
  }

  countByField(field: string): Promise<{ label: string; value: number }[]> {
    return this.repository.countByField(field);
  }

  // --- Domain rules (private) ---

  private async assertSlugIsUnique(
    slug: string,
    excludeId?: string
  ): Promise<void> {
    const filter: QueryFilter<SkillModel> = { slug } as QueryFilter<SkillModel>;
    if (excludeId) {
      (filter as Record<string, unknown>)._id = { $ne: excludeId };
    }
    const exists = await this.repository.existsBy(filter);
    if (exists) {
      throw new ConflictException(`Skill with slug "${slug}" already exists.`);
    }
  }
}
