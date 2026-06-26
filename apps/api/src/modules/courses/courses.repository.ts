import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CrudRepository } from "@/core/persistence/repositories/crud.repository";
import { StatsRepository } from "@/core/persistence/repositories/stats.repository";
import type { CourseEntity } from "./entities/course.entity";
import { toCourseEntity } from "./mappers/course.mapper";
import { CourseModel } from "./schemas/course.schema";

@Injectable()
export class CoursesRepository {
  readonly crud: CrudRepository<CourseModel, CourseEntity>;
  readonly stats: StatsRepository<CourseModel>;

  constructor(@InjectModel(CourseModel.name) model: Model<CourseModel>) {
    this.crud = new CrudRepository(model, toCourseEntity);
    this.stats = new StatsRepository(model);
  }
}
