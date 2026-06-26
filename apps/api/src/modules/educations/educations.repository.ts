import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CrudRepository } from "@/core/persistence/repositories/crud/crud.repository";
import { StatsRepository } from "@/core/persistence/repositories/stats/stats.repository";
import { CreateEducationInput } from "./dto/create-education.input";
import { FilterEducationInput } from "./dto/filter-education.input";
import { SortEducationInput } from "./dto/sort-education.input";
import { UpdateEducationInput } from "./dto/update-education.input";
import type { EducationEntityRecord } from "./entities/education.entity";
import { EducationMapper } from "./mappers/education.mapper";
import { EducationModel } from "./schemas/education.schema";

@Injectable()
export class EducationsRepository {
  private readonly model: Model<EducationModel>;
  readonly crud: CrudRepository<
    EducationModel,
    EducationEntityRecord,
    CreateEducationInput,
    UpdateEducationInput,
    FilterEducationInput,
    SortEducationInput
  >;
  readonly stats: StatsRepository<EducationModel>;

  constructor(@InjectModel(EducationModel.name) model: Model<EducationModel>) {
    this.model = model;
    this.crud = new CrudRepository(model, new EducationMapper());
    this.stats = new StatsRepository(model);
  }

  async detachSkill(skillId: string): Promise<void> {
    await this.model
      .updateMany({ skillIds: skillId }, { $pull: { skillIds: skillId } })
      .exec();
  }

  async purgeByOrganization(organizationId: string): Promise<void> {
    await this.model.deleteMany({ organizationId }).exec();
  }
}
