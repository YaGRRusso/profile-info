import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { SkillModel } from "@/schemas/skill.schema";
import { CreateSkillInput } from "./dto/create-skill.input";
import { UpdateSkillInput } from "./dto/update-skill.input";

@Injectable()
export class SkillsService {
  constructor(@InjectModel(SkillModel.name) private readonly skillModel: Model<SkillModel>) {}

  create(createSkillInput: CreateSkillInput) {
    return this.skillModel.create(createSkillInput);
  }

  findAll() {
    return this.skillModel.find().exec();
  }

  findOne(id: string) {
    return this.skillModel.findById(id).exec();
  }

  findMany(ids: string[]) {
    return this.skillModel.find({ _id: { $in: ids } }).exec();
  }

  update(id: string, updateSkillInput: UpdateSkillInput) {
    return this.skillModel.findByIdAndUpdate(id, updateSkillInput).exec();
  }

  remove(id: string) {
    return this.skillModel.findByIdAndDelete(id).exec();
  }
}
