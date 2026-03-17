import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { clearObject } from "@/core/helpers/object.helper";
import { Search } from "@/core/interfaces/search.interface";
import { OrganizationModel } from "@/schemas/organization.schema";
import { CreateOrganizationInput } from "./dto/create-organization.input";
import { UpdateOrganizationInput } from "./dto/update-organization.input";

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectModel(OrganizationModel.name)
    private readonly organizationModel: Model<OrganizationModel>
  ) {}

  async create(createOrganizationInput: CreateOrganizationInput[]) {
    return await Promise.all(
      createOrganizationInput.map(async (item) => {
        return await this.organizationModel.create(item);
      })
    );
  }

  async findAll({
    filters,
    sort,
    skip = 0,
    limit = 10,
  }: Search<OrganizationModel>) {
    return await this.organizationModel
      .find(clearObject(filters))
      .sort({ isFeatured: -1, updatedAt: -1, ...clearObject(sort) })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async findOneById(id: string) {
    return await this.organizationModel.findById(id).exec();
  }

  async findManyById(ids: string[]) {
    return await this.organizationModel.find({ _id: { $in: ids } }).exec();
  }

  async update(id: string, updateOrganizationInput: UpdateOrganizationInput) {
    return await this.organizationModel
      .findByIdAndUpdate(id, updateOrganizationInput)
      .exec();
  }

  async remove(id: string[]) {
    return await this.organizationModel.deleteMany({ _id: { $in: id } }).exec();
  }
}
