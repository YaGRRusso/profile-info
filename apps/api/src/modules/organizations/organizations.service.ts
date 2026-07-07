import { Injectable, NotFoundException } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { RecentActivityRecord } from "@/common/helpers/recent-activity.helper";
import { catalogPersistenceScope } from "@/core/context/auth-context.helper";
import type { AuthContext } from "@/core/context/auth-context.interface";
import { BatchEntity } from "@/core/entities/batch.entity";
import { DomainEvents } from "@/core/events/domain-events";
import { OrganizationDeletedEvent } from "@/core/events/organization-deleted.event";
import { PERSISTENCE_NOT_FOUND } from "@/core/persistence/persistence.messages";
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

  findOneById(ctx: AuthContext, id: string): Promise<OrganizationEntity> {
    return this.repository.crud
      .scoped(catalogPersistenceScope(ctx))
      .findOneById(id);
  }

  findOne(
    _ctx: AuthContext,
    {
      filters,
    }: {
      filters?: FilterOrganizationInput;
    }
  ): Promise<OrganizationEntity> {
    return this.repository.findOneActive({ filters });
  }

  findOneActiveById(
    _ctx: AuthContext,
    id: string
  ): Promise<OrganizationEntity> {
    return this.repository.findOneActiveById(id);
  }

  findManyById(ctx: AuthContext, ids: string[]): Promise<OrganizationEntity[]> {
    return this.repository.crud
      .scoped(catalogPersistenceScope(ctx))
      .findManyById(ids);
  }

  async findManyActiveById(
    ctx: AuthContext,
    ids: string[]
  ): Promise<OrganizationEntity[]> {
    const organizations = await this.findManyById(ctx, ids);

    if (organizations.some((organization) => organization.disabled)) {
      throw new NotFoundException(PERSISTENCE_NOT_FOUND);
    }

    return organizations;
  }

  findMany(
    _ctx: AuthContext,
    {
      filters,
      sort,
      skip = 0,
      limit = 50,
    }: {
      filters?: FilterOrganizationInput;
      sort?: SortOrganizationInput;
      limit?: number;
      skip?: number;
    }
  ): Promise<MultiPaged<OrganizationEntity>> {
    return this.repository.crud.findMany({ filters, sort, skip, limit });
  }

  findManyActive(
    _ctx: AuthContext,
    {
      filters,
      sort,
      skip = 0,
      limit = 50,
    }: {
      filters?: FilterOrganizationInput;
      sort?: SortOrganizationInput;
      limit?: number;
      skip?: number;
    }
  ): Promise<MultiPaged<OrganizationEntity>> {
    return this.repository.findManyActive({ filters, sort, skip, limit });
  }

  createOne(
    _ctx: AuthContext,
    createInput: CreateOrganizationInput
  ): Promise<OrganizationEntity> {
    return this.repository.crud.createOne(createInput);
  }

  createMany(
    _ctx: AuthContext,
    createInputs: CreateOrganizationInput[]
  ): Promise<BatchEntity> {
    return this.repository.crud.createMany(createInputs);
  }

  updateOne(
    _ctx: AuthContext,
    id: string,
    updateInput: UpdateOrganizationInput
  ): Promise<OrganizationEntity> {
    return this.repository.crud.updateOneById(id, updateInput);
  }

  updateMany(
    _ctx: AuthContext,
    ids: string[],
    updateInput: UpdateOrganizationInput
  ): Promise<BatchEntity> {
    return this.repository.crud.updateManyById(ids, updateInput);
  }

  disableOne(_ctx: AuthContext, id: string): Promise<OrganizationEntity> {
    return this.repository.crud.updateOneById(id, { disabled: true });
  }

  disableMany(_ctx: AuthContext, ids: string[]): Promise<BatchEntity> {
    return this.repository.crud.updateManyById(ids, { disabled: true });
  }

  enableOne(_ctx: AuthContext, id: string): Promise<OrganizationEntity> {
    return this.repository.crud.updateOneById(id, { disabled: false });
  }

  enableMany(_ctx: AuthContext, ids: string[]): Promise<BatchEntity> {
    return this.repository.crud.updateManyById(ids, { disabled: false });
  }

  async removeOne(_ctx: AuthContext, id: string): Promise<OrganizationEntity> {
    const organization = await this.repository.crud.findOneById(id);

    await this.eventEmitter.emitAsync(
      DomainEvents.organization.deleted,
      new OrganizationDeletedEvent(organization.id)
    );

    await this.repository.crud.deleteOneById(id);
    return organization;
  }

  async removeMany(_ctx: AuthContext, ids: string[]): Promise<BatchEntity> {
    const organizations = await this.repository.crud.findManyById(ids);

    for (const organization of organizations) {
      await this.eventEmitter.emitAsync(
        DomainEvents.organization.deleted,
        new OrganizationDeletedEvent(organization.id)
      );
    }

    return this.repository.crud.deleteManyById(ids);
  }

  count(_ctx: AuthContext): Promise<number> {
    return this.repository.countActive();
  }

  async findRecentActivity(
    _ctx: AuthContext,
    limit: number
  ): Promise<RecentActivityRecord[]> {
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
