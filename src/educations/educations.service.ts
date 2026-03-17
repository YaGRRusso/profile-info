import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { clearFilters, clearSort } from "@/core/helpers/search.helper";
import { Search } from "@/core/interfaces/search.interface";
import { EducationModel } from "@/schemas/education.schema";
import { CreateEducationInput } from "./dto/create-education.input";
import { UpdateEducationInput } from "./dto/update-education.input";

@Injectable()
export class EducationsService {
  constructor(
    @InjectModel(EducationModel.name)
    private readonly educationModel: Model<EducationModel>
  ) {}

  async create(createEducationInput: CreateEducationInput[]) {
    return await Promise.all(
      createEducationInput.map(async (item) => {
        return await this.educationModel.create(item);
      })
    );
  }

  async findAll({
    filters,
    sort,
    skip = 0,
    limit = 10,
  }: Search<EducationModel>) {
    return await this.educationModel
      .find(clearFilters(filters))
      .sort(clearSort(sort))
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async findOneById(id: string) {
    return await this.educationModel.findById(id).exec();
  }

  async update(id: string, updateEducationInput: UpdateEducationInput) {
    return await this.educationModel
      .findByIdAndUpdate(id, updateEducationInput)
      .exec();
  }

  async remove(id: string[]) {
    return await this.educationModel.deleteMany({ _id: { $in: id } }).exec();
  }
}
