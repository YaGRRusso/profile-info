import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CrudRepository } from "@/core/persistence/repositories/crud/crud.repository";
import { StatsRepository } from "@/core/persistence/repositories/stats/stats.repository";
import { CourseMapper } from "./course.mapper";
import type { CourseEntityRecord } from "./entities/course.entity";
import { CourseModel } from "./schemas/course.schema";

@Injectable()
export class CoursesRepository {
  private readonly model: Model<CourseModel>;
  readonly crud: CrudRepository<CourseModel, CourseEntityRecord>;
  readonly stats: StatsRepository<CourseModel>;

  constructor(@InjectModel(CourseModel.name) model: Model<CourseModel>) {
    this.model = model;
    this.crud = new CrudRepository(model, new CourseMapper());
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
