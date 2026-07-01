import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { PERSISTENCE_NOT_FOUND } from "@/core/persistence/persistence.messages";
import { CrudRepository } from "@/core/persistence/repositories/crud/crud.repository";
import { StatsRepository } from "@/core/persistence/repositories/stats/stats.repository";
import type {
  FindManyQuery,
  FindOneQuery,
} from "@/core/persistence/types/input.type";
import { CreateSkillInput } from "./dto/create-skill.input";
import { FilterSkillInput } from "./dto/filter-skill.input";
import { SortSkillInput } from "./dto/sort-skill.input";
import { UpdateSkillInput } from "./dto/update-skill.input";
import type { SkillEntity } from "./entities/skill.entity";
import { SkillMapper } from "./mappers/skill.mapper";
import { SkillModel } from "./schemas/skill.schema";

const NOT_DISABLED = { disabled: { $ne: true } } as const;

@Injectable()
export class SkillsRepository {
  readonly crud: CrudRepository<
    SkillModel,
    SkillEntity,
    CreateSkillInput,
    UpdateSkillInput,
    FilterSkillInput,
    SortSkillInput
  >;
  readonly stats: StatsRepository<SkillModel>;

  constructor(@InjectModel(SkillModel.name) model: Model<SkillModel>) {
    this.crud = new CrudRepository(model, new SkillMapper());
    this.stats = new StatsRepository(model);
  }

  findOneActive({ filters, ...query }: FindOneQuery<FilterSkillInput>) {
    return this.crud.findOne({
      ...query,
      filters: { ...filters, disabled: filters?.disabled ?? false },
    });
  }

  async findOneActiveById(id: string): Promise<SkillEntity> {
    const skill = await this.crud.findOneById(id);

    if (skill.disabled) {
      throw new NotFoundException(PERSISTENCE_NOT_FOUND);
    }

    return skill;
  }

  findManyActive({
    filters,
    ...query
  }: FindManyQuery<FilterSkillInput, SortSkillInput>) {
    return this.crud.findMany({
      ...query,
      filters: { ...filters, disabled: filters?.disabled ?? false },
    });
  }

  async findManyActiveById(ids: string[]): Promise<SkillEntity[]> {
    const skills = await this.crud.findManyById(ids);

    const isDisabled = skills.some((skill) => skill.disabled);
    if (isDisabled) {
      throw new NotFoundException(PERSISTENCE_NOT_FOUND);
    }

    return skills;
  }

  countActive(): Promise<number> {
    return this.stats.count(NOT_DISABLED);
  }

  findRecentlyUpdatedActive(limit: number, projection: string) {
    return this.stats.findRecentlyUpdated(limit, projection, NOT_DISABLED);
  }
}
