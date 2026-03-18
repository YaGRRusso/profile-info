import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseService } from "@/core/services/base.service";
import { EducationModel } from "@/schemas/education.schema";
import { CreateEducationInput } from "./dto/create-education.input";
import { UpdateEducationInput } from "./dto/update-education.input";
import { EducationEntity } from "./entities/education.entity";

@Injectable()
export class EducationsService extends BaseService<
  EducationModel,
  EducationEntity,
  CreateEducationInput,
  UpdateEducationInput
> {
  constructor(
    @InjectModel(EducationModel.name)
    readonly educationModel: Model<EducationModel>
  ) {
    super(educationModel);
  }
}
