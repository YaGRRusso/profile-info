import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseService } from "@/core/services/base.service";
import { SkillModel } from "@/schemas/skill.schema";
import { CreateSkillInput } from "./dto/create-skill.input";
import { UpdateSkillInput } from "./dto/update-skill.input";

@Injectable()
export class SkillsService extends BaseService<
  SkillModel,
  CreateSkillInput,
  UpdateSkillInput
> {
  constructor(
    @InjectModel(SkillModel.name)
    readonly skillModel: Model<SkillModel>
  ) {
    super(skillModel);
  }
}
