import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { isNil } from "lodash";
import { Model, QueryFilter } from "mongoose";
import { BatchEntity } from "@/core/entities/batch.entity";
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

  // QUERIES

  async findOneById(id: string): Promise<OrganizationModel> {
    const res = await this.organizationModel.findById(id).exec();

    if (isNil(res)) throw new NotFoundException("Not Found");
    return res;
  }

  async findOne(
    filters?: QueryFilter<OrganizationModel>
  ): Promise<OrganizationModel> {
    const res = await this.organizationModel
      .findOne(clearObject(filters))
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Found");
    return res;
  }

  async findManyById(ids: string[]): Promise<OrganizationModel[]> {
    const res = await this.organizationModel.find({ _id: { $in: ids } }).exec();

    if (isNil(res)) throw new NotFoundException("Not Found");
    return res;
  }

  async findMany({
    filters,
    sort,
    skip = 0,
    limit = 10,
  }: Search<OrganizationModel>): Promise<OrganizationModel[]> {
    const res = await this.organizationModel
      .find(clearObject(filters))
      .sort({ isFeatured: -1, updatedAt: -1, ...clearObject(sort) })
      .skip(skip)
      .limit(limit)
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Found");
    return res;
  }

  // MUTATIONS

  async createOne(
    createOrganizationInput: CreateOrganizationInput
  ): Promise<OrganizationModel> {
    const res = await this.organizationModel.create(createOrganizationInput);

    if (isNil(res)) throw new BadRequestException("Not Created");
    return res;
  }

  async createMany(
    createOrganizationInputs: CreateOrganizationInput[]
  ): Promise<OrganizationModel[]> {
    const res = await this.organizationModel.create(createOrganizationInputs);

    if (isNil(res)) throw new BadRequestException("Not Created");
    return res;
  }

  async updateOne(
    id: string,
    updateOrganizationInput: UpdateOrganizationInput
  ): Promise<OrganizationModel> {
    const res = await this.organizationModel
      .findByIdAndUpdate(id, updateOrganizationInput)
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Updated");
    return res;
  }

  async updateMany(
    ids: string[],
    updateOrganizationInput: UpdateOrganizationInput
  ): Promise<BatchEntity> {
    const res = await this.organizationModel
      .updateMany({ _id: { $in: ids } }, updateOrganizationInput)
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Updated");
    return { count: res.modifiedCount };
  }

  async removeOne(id: string): Promise<OrganizationModel> {
    const res = await this.organizationModel.findByIdAndDelete(id).exec();

    if (isNil(res)) throw new NotFoundException("Not Removed");
    return res;
  }

  async removeMany(ids: string[]): Promise<BatchEntity> {
    const res = await this.organizationModel
      .deleteMany({ _id: { $in: ids } })
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Removed");
    return { count: res.deletedCount };
  }
}
