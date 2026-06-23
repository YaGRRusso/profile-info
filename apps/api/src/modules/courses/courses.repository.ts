import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CrudRepository } from "@/core/persistence/repositories/crud.repository";
import { TenantScopedCrudRepository } from "@/core/persistence/repositories/tenant-scoped-crud.repository";
import { TenantScopedStatsRepository } from "@/core/persistence/repositories/tenant-scoped-stats.repository";
import { CourseModel } from "./schemas/course.schema";

@Injectable()
export class CoursesRepository extends CrudRepository<CourseModel> {
  readonly tenantStats: TenantScopedStatsRepository<CourseModel>;
  readonly tenant: TenantScopedCrudRepository<CourseModel>;

  constructor(@InjectModel(CourseModel.name) courseModel: Model<CourseModel>) {
    super(courseModel);
    this.tenantStats = new TenantScopedStatsRepository(courseModel);
    this.tenant = new TenantScopedCrudRepository(this);
  }
}
