import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { tenantPersistenceScope } from "@/core/context/auth-context.helper";
import type { AuthContext } from "@/core/context/auth-context.interface";
import { CrudRepository } from "@/core/persistence/repositories/crud/crud.repository";
import { StatsRepository } from "@/core/persistence/repositories/stats/stats.repository";
import { CreateCourseInput } from "./dto/create-course.input";
import { FilterCourseInput } from "./dto/filter-course.input";
import { SortCourseInput } from "./dto/sort-course.input";
import { UpdateCourseInput } from "./dto/update-course.input";
import type { CourseEntityRecord } from "./entities/course.entity";
import { CourseMapper } from "./mappers/course.mapper";
import { CourseModel } from "./schemas/course.schema";

@Injectable()
export class CoursesRepository {
  private readonly model: Model<CourseModel>;
  readonly crud: CrudRepository<
    CourseModel,
    CourseEntityRecord,
    CreateCourseInput,
    UpdateCourseInput,
    FilterCourseInput,
    SortCourseInput
  >;
  readonly stats: StatsRepository<CourseModel>;

  constructor(@InjectModel(CourseModel.name) model: Model<CourseModel>) {
    this.model = model;
    this.crud = new CrudRepository(model, new CourseMapper());
    this.stats = new StatsRepository(model);
  }

  tenantCrud(ctx: AuthContext) {
    return this.crud.scoped(tenantPersistenceScope(ctx));
  }

  tenantStats(ctx: AuthContext) {
    return this.stats.scoped(tenantPersistenceScope(ctx));
  }

  async detachSkill(skillId: string): Promise<void> {
    await this.model
      .updateMany({ skillIds: skillId }, { $pull: { skillIds: skillId } })
      .exec();
  }

  async purgeByOrganization(organizationId: string): Promise<void> {
    await this.model.deleteMany({ organizationId }).exec();
  }

  async purgeByOwner(ownerId: string): Promise<void> {
    await this.model.deleteMany({ ownerId }).exec();
  }

  countByOwners(ownerIds: string[]) {
    return this.stats.global().countByOwnerIds(ownerIds);
  }
}
