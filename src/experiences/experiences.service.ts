import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseService } from "@/core/services/base.service";
import { ExperienceModel } from "@/schemas/experience.schema";
import { CreateExperienceInput } from "./dto/create-experience.input";
import { UpdateExperienceInput } from "./dto/update-experience.input";

@Injectable()
export class ExperiencesService extends BaseService<
  ExperienceModel,
  CreateExperienceInput,
  UpdateExperienceInput
> {
  constructor(
    @InjectModel(ExperienceModel.name)
    readonly experienceModel: Model<ExperienceModel>
  ) {
    super(experienceModel);
  }
}
