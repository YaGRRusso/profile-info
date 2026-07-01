import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { RecentActivityRecord } from "@/common/helpers/recent-activity.helper";
import { BatchEntity } from "@/core/entities/batch.entity";
import { DomainEvents } from "@/core/events/domain-events";
import { OrganizationDeletedEvent } from "@/core/events/organization-deleted.event";
import type { MultiPaged } from "@/core/persistence/types/output.type";
import { CreateOrganizationInput } from "./dto/create-organization.input";
import { FilterOrganizationInput } from "./dto/filter-organization.input";
import { SortOrganizationInput } from "./dto/sort-organization.input";
import { UpdateOrganizationInput } from "./dto/update-organization.input";
import { OrganizationEntity } from "./entities/organization.entity";
import { OrganizationsRepository } from "./organizations.repository";

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly repository: OrganizationsRepository,
    private readonly eventEmitter: EventEmitter2
  ) {}

  findOneById(id: string): Promise<OrganizationEntity> {
    return this.repository.crud.findOneById(id);
  }

  findOne({
    filters,
  }: {
    filters?: FilterOrganizationInput;
  }): Promise<OrganizationEntity> {
    return this.repository.findOneActive({ filters });
  }

  findOneActiveById(id: string): Promise<OrganizationEntity> {
    return this.repository.findOneActiveById(id);
  }

  findManyById(ids: string[]): Promise<OrganizationEntity[]> {
    return this.repository.crud.findManyById(ids);
  }

  findManyActiveById(ids: string[]): Promise<OrganizationEntity[]> {
    return this.repository.findManyActiveById(ids);
  }

  findMany({
    filters,
    sort,
    skip = 0,
    limit = 50,
  }: {
    filters?: FilterOrganizationInput;
    sort?: SortOrganizationInput;
    limit?: number;
    skip?: number;
  }): Promise<MultiPaged<OrganizationEntity>> {
    return this.repository.findManyActive({ filters, sort, skip, limit });
  }

  createOne(createInput: CreateOrganizationInput): Promise<OrganizationEntity> {
    return this.repository.crud.createOne(createInput);
  }

  createMany(createInputs: CreateOrganizationInput[]): Promise<BatchEntity> {
    return this.repository.crud.createMany(createInputs);
  }

  updateOne(
    id: string,
    updateInput: UpdateOrganizationInput
  ): Promise<OrganizationEntity> {
    return this.repository.crud.updateOneById(id, updateInput);
  }

  updateMany(
    ids: string[],
    updateInput: UpdateOrganizationInput
  ): Promise<BatchEntity> {
    return this.repository.crud.updateManyById(ids, updateInput);
  }

  disableOne(id: string): Promise<OrganizationEntity> {
    return this.repository.crud.updateOneById(id, { disabled: true });
  }

  disableMany(ids: string[]): Promise<BatchEntity> {
    return this.repository.crud.updateManyById(ids, { disabled: true });
  }

  enableOne(id: string): Promise<OrganizationEntity> {
    return this.repository.crud.updateOneById(id, { disabled: false });
  }

  enableMany(ids: string[]): Promise<BatchEntity> {
    return this.repository.crud.updateManyById(ids, { disabled: false });
  }

  async removeOne(id: string): Promise<OrganizationEntity> {
    const organization = await this.repository.crud.findOneById(id);

    await this.eventEmitter.emitAsync(
      DomainEvents.organization.deleted,
      new OrganizationDeletedEvent(organization.id)
    );

    await this.repository.crud.deleteOneById(id);
    return organization;
  }

  async removeMany(ids: string[]): Promise<BatchEntity> {
    const organizations = await this.repository.crud.findManyById(ids);

    for (const organization of organizations) {
      await this.eventEmitter.emitAsync(
        DomainEvents.organization.deleted,
        new OrganizationDeletedEvent(organization.id)
      );
    }

    return this.repository.crud.deleteManyById(ids);
  }

  count(): Promise<number> {
    return this.repository.countActive();
  }

  async findRecentActivity(limit: number): Promise<RecentActivityRecord[]> {
    const rows = await this.repository.findRecentlyUpdatedActive(
      limit,
      "name updatedAt"
    );
    return rows.map((row) => ({
      label: row.name as string,
      updatedAt: row.updatedAt,
    }));
  }
}
