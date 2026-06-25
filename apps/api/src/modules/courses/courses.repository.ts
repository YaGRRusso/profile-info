import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CrudRepository } from "@/core/persistence/repositories/crud.repository";
import { StatsRepository } from "@/core/persistence/repositories/stats.repository";
import { TenantScopedCrudRepository } from "@/core/persistence/repositories/tenant-scoped-crud.repository";
import { TenantScopedStatsRepository } from "@/core/persistence/repositories/tenant-scoped-stats.repository";
import type { CourseEntity } from "./entities/course.entity";
import { toCourseEntity } from "./mappers/course.mapper";
import { CourseModel } from "./schemas/course.schema";

@Injectable()
export class CoursesRepository {
  readonly crud: CrudRepository<CourseModel, CourseEntity>;
  readonly tenantCrud: TenantScopedCrudRepository<CourseModel, CourseEntity>;
  readonly stats: StatsRepository<CourseModel>;
  readonly tenantStats: TenantScopedStatsRepository<CourseModel>;

  constructor(@InjectModel(CourseModel.name) model: Model<CourseModel>) {
    this.crud = new CrudRepository(model, toCourseEntity);
    this.tenantCrud = new TenantScopedCrudRepository(this.crud);
    this.stats = new StatsRepository(model);
    this.tenantStats = new TenantScopedStatsRepository(this.stats);
  }
}
