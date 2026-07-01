import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CrudRepository } from "@/core/persistence/repositories/crud/crud.repository";
import { StatsRepository } from "@/core/persistence/repositories/stats/stats.repository";
import { CreateExperienceInput } from "./dto/create-experience.input";
import { FilterExperienceInput } from "./dto/filter-experience.input";
import { SortExperienceInput } from "./dto/sort-experience.input";
import { UpdateExperienceInput } from "./dto/update-experience.input";
import type { ExperienceEntityRecord } from "./entities/experience.entity";
import { ExperienceMapper } from "./mappers/experience.mapper";
import { ExperienceModel } from "./schemas/experience.schema";

@Injectable()
export class ExperiencesRepository {
  private readonly model: Model<ExperienceModel>;
  readonly crud: CrudRepository<
    ExperienceModel,
    ExperienceEntityRecord,
    CreateExperienceInput,
    UpdateExperienceInput,
    FilterExperienceInput,
    SortExperienceInput
  >;
  readonly stats: StatsRepository<ExperienceModel>;

  constructor(
    @InjectModel(ExperienceModel.name) model: Model<ExperienceModel>
  ) {
    this.model = model;
    this.crud = new CrudRepository(model, new ExperienceMapper());
    this.stats = new StatsRepository(model);
  }

  async detachSkill(skillId: string): Promise<void> {
    await this.model
      .updateMany(
        { "roles.skillIds": skillId },
        { $pull: { "roles.$[roleElem].skillIds": skillId } },
        { arrayFilters: [{ "roleElem.skillIds": skillId }] }
      )
      .exec();
  }

  async purgeByOrganization(organizationId: string): Promise<void> {
    await this.model.deleteMany({ organizationId }).exec();
  }

  async purgeByOwner(ownerId: string): Promise<void> {
    await this.model.deleteMany({ ownerId }).exec();
  }
}
