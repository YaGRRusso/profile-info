import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { clearObject } from "@/core/helpers/object.helper";
import { Search } from "@/core/interfaces/search.interface";
import { ExperienceModel } from "@/schemas/experience.schema";
import { CreateExperienceInput } from "./dto/create-experience.input";
import { UpdateExperienceInput } from "./dto/update-experience.input";

@Injectable()
export class ExperiencesService {
  constructor(
    @InjectModel(ExperienceModel.name)
    private readonly experienceModel: Model<ExperienceModel>
  ) {}

  async create(createExperienceInput: CreateExperienceInput[]) {
    return await Promise.all(
      createExperienceInput.map(async (item) => {
        return await this.experienceModel.create(item);
      })
    );
  }

  async findAll({
    filters,
    sort,
    skip = 0,
    limit = 10,
  }: Search<ExperienceModel>) {
    return await this.experienceModel
      .find(clearObject(filters))
      .sort({ isFeatured: -1, updatedAt: -1, ...clearObject(sort) })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async findOneById(id: string) {
    return await this.experienceModel.findById(id).exec();
  }

  async update(id: string, updateExperienceInput: UpdateExperienceInput) {
    return await this.experienceModel
      .findByIdAndUpdate(id, updateExperienceInput)
      .exec();
  }

  async remove(id: string[]) {
    return await this.experienceModel.deleteMany({ _id: { $in: id } }).exec();
  }
}
