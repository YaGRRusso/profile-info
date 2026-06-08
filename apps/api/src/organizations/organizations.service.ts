import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { isNil } from "lodash";
import {
  AnyKeys,
  isValidObjectId,
  Model,
  QueryFilter,
  SortOrder,
  UpdateQuery,
} from "mongoose";
import { BatchEntity } from "@/core/entities/batch.entity";
import { clearObject } from "@/core/helpers/object.helper";
import { PaginatedModel } from "@/core/schemas/paginated.schema";
import { OrganizationModel } from "@/schemas/organization.schema";
import { CreateOrganizationInput } from "./dto/create-organization.input";
import { UpdateOrganizationInput } from "./dto/update-organization.input";

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectModel(OrganizationModel.name)
    readonly organizationModel: Model<OrganizationModel>
  ) {}

  async findOneById(id: string): Promise<OrganizationModel> {
    if (!isValidObjectId(id)) throw new BadRequestException("Invalid ID");

    const res = await this.organizationModel.findById(id).exec();

    if (isNil(res)) throw new NotFoundException("Not Found");
    return res;
  }

  async findOne({
    filters,
  }: {
    filters?: QueryFilter<OrganizationModel>;
  }): Promise<OrganizationModel> {
    const res = await this.organizationModel
      .findOne(clearObject(filters) as QueryFilter<OrganizationModel>)
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Found");
    return res;
  }

  async findManyById(ids: string[]): Promise<OrganizationModel[]> {
    if (ids.some((id) => !isValidObjectId(id)))
      throw new BadRequestException("Invalid ID");

    const res = await this.organizationModel
      .find({ _id: { $in: ids } } as QueryFilter<OrganizationModel>)
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Found");
    return res;
  }

  async findMany({
    filters,
    sort,
    skip = 0,
    limit = 50,
  }: {
    filters?: QueryFilter<OrganizationModel>;
    sort?: Partial<Record<keyof OrganizationModel, SortOrder>>;
    limit?: number;
    skip?: number;
  }): Promise<PaginatedModel<OrganizationModel>> {
    const nodes = await this.organizationModel
      .find(clearObject(filters) as QueryFilter<OrganizationModel>)
      .sort(clearObject(sort) as Record<keyof OrganizationModel, SortOrder>)
      .skip(skip)
      .limit(limit)
      .exec();

    const found = await this.organizationModel
      .countDocuments(clearObject(filters) as QueryFilter<OrganizationModel>)
      .exec();

    if (isNil(nodes) || isNil(found)) throw new NotFoundException("Not Found");
    return {
      nodes,
      found,
    };
  }

  async createOne(
    createInput: CreateOrganizationInput
  ): Promise<OrganizationModel> {
    const res = await this.organizationModel.create(
      createInput as AnyKeys<OrganizationModel>
    );

    if (isNil(res)) throw new BadRequestException("Not Created");
    return res;
  }

  async createMany(
    createInputs: CreateOrganizationInput[]
  ): Promise<OrganizationModel[]> {
    const res = await this.organizationModel.create(
      createInputs as AnyKeys<OrganizationModel>[]
    );

    if (isNil(res)) throw new BadRequestException("Not Created");
    return res;
  }

  async updateOne(
    id: string,
    updateInput: UpdateOrganizationInput
  ): Promise<OrganizationModel> {
    if (!isValidObjectId(id)) throw new BadRequestException("Invalid ID");

    const res = await this.organizationModel
      .findByIdAndUpdate(
        id,
        updateInput as object as UpdateQuery<OrganizationModel>
      )
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Updated");
    return res;
  }

  async updateMany(
    ids: string[],
    updateInput: UpdateOrganizationInput
  ): Promise<BatchEntity> {
    if (ids.some((id) => !isValidObjectId(id)))
      throw new BadRequestException("Invalid ID");

    const res = await this.organizationModel
      .updateMany(
        { _id: { $in: ids } } as QueryFilter<OrganizationModel>,
        updateInput as object as UpdateQuery<OrganizationModel>
      )
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Updated");
    return { count: res.modifiedCount };
  }

  async removeOne(id: string): Promise<OrganizationModel> {
    if (!isValidObjectId(id)) throw new BadRequestException("Invalid ID");

    const res = await this.organizationModel.findByIdAndDelete(id).exec();

    if (isNil(res)) throw new NotFoundException("Not Removed");
    return res;
  }

  async removeMany(ids: string[]): Promise<BatchEntity> {
    if (ids.some((id) => !isValidObjectId(id)))
      throw new BadRequestException("Invalid ID");

    const res = await this.organizationModel
      .deleteMany({ _id: { $in: ids } } as QueryFilter<OrganizationModel>)
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Removed");
    return { count: res.deletedCount };
  }
}
