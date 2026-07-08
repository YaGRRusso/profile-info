import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { catalogPersistenceScope } from "@/core/context/auth-context.helper";
import type { AuthContext } from "@/core/context/auth-context.interface";
import { CrudRepository } from "@/core/persistence/repositories/crud/crud.repository";
import { StatsRepository } from "@/core/persistence/repositories/stats/stats.repository";
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

  catalogCrud(ctx: AuthContext) {
    return this.crud.scoped(catalogPersistenceScope(ctx));
  }

  catalogStats(ctx: AuthContext) {
    return this.stats.scoped(catalogPersistenceScope(ctx));
  }

  countActive(ctx: AuthContext): Promise<number> {
    return this.catalogStats(ctx).count(NOT_DISABLED);
  }

  findRecentlyUpdatedActive(
    ctx: AuthContext,
    limit: number,
    projection: string
  ) {
    return this.catalogStats(ctx).findRecentlyUpdated(
      limit,
      projection,
      NOT_DISABLED
    );
  }
}
