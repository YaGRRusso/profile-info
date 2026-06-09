import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { InjectModel } from "@nestjs/mongoose";
import { isNil } from "lodash";
import { AnyKeys, Model, QueryFilter, SortOrder, UpdateQuery } from "mongoose";
import { clearObject } from "@/common/helpers/object.helper";
import {
  assertValidObjectId,
  assertValidObjectIds,
} from "@/common/helpers/object-id.helper";
import { BatchEntity } from "@/core/entities/batch.entity";
import { DomainEvents } from "@/core/events/domain-events";
import { OrganizationDeletedEvent } from "@/core/events/organization-deleted.event";
import { PaginatedModel } from "@/core/schemas/paginated.schema";
import { OrganizationModel } from "@/modules/organizations/schemas/organization.schema";
import { CreateOrganizationInput } from "./dto/create-organization.input";
import { UpdateOrganizationInput } from "./dto/update-organization.input";

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectModel(OrganizationModel.name)
    readonly organizationModel: Model<OrganizationModel>,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async findOneById(id: string): Promise<OrganizationModel> {
    assertValidObjectId(id);

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
    assertValidObjectIds(ids);

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
    assertValidObjectId(id);

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
    assertValidObjectIds(ids);

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
    assertValidObjectId(id);

    const res = await this.organizationModel.findById(id).exec();

    if (isNil(res)) throw new NotFoundException("Not Removed");

    await this.eventEmitter.emitAsync(
      DomainEvents.organization.deleted,
      new OrganizationDeletedEvent(res._id.toString())
    );

    await this.organizationModel.findByIdAndDelete(id).exec();
    return res;
  }

  async removeMany(ids: string[]): Promise<BatchEntity> {
    assertValidObjectIds(ids);

    const organizations = await this.organizationModel
      .find({ _id: { $in: ids } } as QueryFilter<OrganizationModel>)
      .exec();

    for (const organization of organizations) {
      await this.eventEmitter.emitAsync(
        DomainEvents.organization.deleted,
        new OrganizationDeletedEvent(organization._id.toString())
      );
    }

    const res = await this.organizationModel
      .deleteMany({ _id: { $in: ids } } as QueryFilter<OrganizationModel>)
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Removed");
    return { count: res.deletedCount };
  }

  async count(): Promise<number> {
    return await this.organizationModel.countDocuments().exec();
  }
}
