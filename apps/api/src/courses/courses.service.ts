import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseService } from "@/core/services/base.service";
import { CourseModel } from "@/schemas/course.schema";
import { CreateCourseInput } from "./dto/create-course.input";
import { UpdateCourseInput } from "./dto/update-course.input";

@Injectable()
export class CoursesService extends BaseService<
  CourseModel,
  CreateCourseInput,
  UpdateCourseInput
> {
  constructor(
    @InjectModel(CourseModel.name)
    readonly courseModel: Model<CourseModel>
  ) {
    super(courseModel);
  }
}
