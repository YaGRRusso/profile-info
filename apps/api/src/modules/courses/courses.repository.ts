import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { MongooseCrudRepository } from "@/core/persistence/mongoose-crud.repository";
import { CourseModel } from "./schemas/course.schema";

@Injectable()
export class CoursesRepository extends MongooseCrudRepository<CourseModel> {
  constructor(@InjectModel(CourseModel.name) courseModel: Model<CourseModel>) {
    super(courseModel);
  }
}
