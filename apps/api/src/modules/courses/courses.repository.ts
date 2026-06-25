import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CrudRepository } from "@/core/persistence/repositories/crud.repository";
import { TenantScopedCrudRepository } from "@/core/persistence/repositories/tenant-scoped-crud.repository";
import { TenantScopedStatsRepository } from "@/core/persistence/repositories/tenant-scoped-stats.repository";
import type { CourseEntity } from "./entities/course.entity";
import { toCourseEntity } from "./mappers/course.mapper";
import { CourseModel } from "./schemas/course.schema";

@Injectable()
export class CoursesRepository extends CrudRepository<
  CourseModel,
  CourseEntity
> {
  readonly tenantStats: TenantScopedStatsRepository<CourseModel>;
  readonly tenant: TenantScopedCrudRepository<CourseModel, CourseEntity>;

  constructor(@InjectModel(CourseModel.name) model: Model<CourseModel>) {
    super(model);
    this.tenantStats = new TenantScopedStatsRepository(model);
    this.tenant = new TenantScopedCrudRepository(this);
  }

  protected toEntity(model: CourseModel): CourseEntity {
    return toCourseEntity(model);
  }
}
