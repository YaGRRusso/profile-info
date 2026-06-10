import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { AnyKeys, QueryFilter, SortOrder, UpdateQuery } from "mongoose";
import { BatchEntity } from "@/core/entities/batch.entity";
import { DomainEvents } from "@/core/events/domain-events";
import { OrganizationDeletedEvent } from "@/core/events/organization-deleted.event";
import { PaginatedModel } from "@/core/schemas/paginated.schema";
import { OrganizationModel } from "@/modules/organizations/schemas/organization.schema";
import { CreateOrganizationInput } from "./dto/create-organization.input";
import { UpdateOrganizationInput } from "./dto/update-organization.input";
import { OrganizationsRepository } from "./organizations.repository";

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly repository: OrganizationsRepository,
    private readonly eventEmitter: EventEmitter2
  ) {}

  findOneById(id: string): Promise<OrganizationModel> {
    return this.repository.findOneById(id);
  }

  findOne({
    filters,
  }: {
    filters?: QueryFilter<OrganizationModel>;
  }): Promise<OrganizationModel> {
    return this.repository.findOne({ filters });
  }

  findManyById(ids: string[]): Promise<OrganizationModel[]> {
    return this.repository.findManyById(ids);
  }

  findMany({
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
    return this.repository.findMany({ filters, sort, skip, limit });
  }

  createOne(createInput: CreateOrganizationInput): Promise<OrganizationModel> {
    return this.repository.createOne(createInput as AnyKeys<OrganizationModel>);
  }

  createMany(
    createInputs: CreateOrganizationInput[]
  ): Promise<OrganizationModel[]> {
    return this.repository.createMany(
      createInputs as AnyKeys<OrganizationModel>[]
    );
  }

  updateOne(
    id: string,
    updateInput: UpdateOrganizationInput
  ): Promise<OrganizationModel> {
    return this.repository.updateOne(
      id,
      updateInput as object as UpdateQuery<OrganizationModel>
    );
  }

  updateMany(
    ids: string[],
    updateInput: UpdateOrganizationInput
  ): Promise<BatchEntity> {
    return this.repository.updateMany(
      ids,
      updateInput as object as UpdateQuery<OrganizationModel>
    );
  }

  async removeOne(id: string): Promise<OrganizationModel> {
    const organization = await this.repository.findOneById(id);

    await this.eventEmitter.emitAsync(
      DomainEvents.organization.deleted,
      new OrganizationDeletedEvent(organization._id.toString())
    );

    await this.repository.deleteOne(id);
    return organization;
  }

  async removeMany(ids: string[]): Promise<BatchEntity> {
    const organizations = await this.repository.findManyById(ids);

    for (const organization of organizations) {
      await this.eventEmitter.emitAsync(
        DomainEvents.organization.deleted,
        new OrganizationDeletedEvent(organization._id.toString())
      );
    }

    return this.repository.deleteMany(ids);
  }

  count(): Promise<number> {
    return this.repository.count();
  }
}
