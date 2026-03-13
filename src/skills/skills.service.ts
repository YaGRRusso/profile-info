import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { SkillModel } from "@/schemas/skill.schema";
import { CreateSkillInput } from "./dto/create-skill.input";
import { UpdateSkillInput } from "./dto/update-skill.input";

@Injectable()
export class SkillsService {
  constructor(
    @InjectModel(SkillModel.name) private readonly skillModel: Model<SkillModel>
  ) {}

  async create(createSkillInput: CreateSkillInput[]) {
    return await Promise.all(
      createSkillInput.map(async (item) => {
        return await this.skillModel.create(item);
      })
    );
  }

  async findAll() {
    return await this.skillModel.find().exec();
  }

  async findOneById(id: string) {
    return await this.skillModel.findById(id).exec();
  }

  async findManyById(ids: string[]) {
    return await this.skillModel.find({ _id: { $in: ids } }).exec();
  }

  async update(id: string, updateSkillInput: UpdateSkillInput) {
    return await this.skillModel.findByIdAndUpdate(id, updateSkillInput).exec();
  }

  async remove(id: string[]) {
    return await this.skillModel.deleteMany({ _id: { $in: id } }).exec();
  }
}
