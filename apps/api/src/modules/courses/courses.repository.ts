import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CrudRepository } from "@/core/persistence/repositories/crud.repository";
import { StatsRepository } from "@/core/persistence/repositories/stats.repository";
import { CourseModel } from "./schemas/course.schema";

@Injectable()
export class CoursesRepository extends CrudRepository<CourseModel> {
  readonly stats: StatsRepository<CourseModel>;

  constructor(@InjectModel(CourseModel.name) courseModel: Model<CourseModel>) {
    super(courseModel);
    this.stats = new StatsRepository(courseModel);
  }
}
