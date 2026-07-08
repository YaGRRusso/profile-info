import { Injectable, NotFoundException } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { RecentActivityRecord } from "@/common/helpers/recent-activity.helper";
import type { AuthContext } from "@/core/context/auth-context.interface";
import { BatchEntity } from "@/core/entities/batch.entity";
import { DomainEvents } from "@/core/events/domain-events";
import { OrganizationDeletedEvent } from "@/core/events/organization-deleted.event";
import { PERSISTENCE_NOT_FOUND } from "@/core/persistence/persistence.messages";
import type {
  FieldCount,
  MultiPaged,
} from "@/core/persistence/types/output.type";
import { CreateOrganizationInput } from "./dto/create-organization.input";
import { FilterOrganizationInput } from "./dto/filter-organization.input";
import { SortOrganizationInput } from "./dto/sort-organization.input";
import { UpdateOrganizationInput } from "./dto/update-organization.input";
import type { OrganizationEntityRecord } from "./entities/organization.entity";
import { OrganizationsRepository } from "./organizations.repository";

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly repository: OrganizationsRepository,
    private readonly eventEmitter: EventEmitter2
  ) {}

  findOneById(ctx: AuthContext, id: string): Promise<OrganizationEntityRecord> {
    return this.repository.catalogCrud(ctx).findOneById(id);
  }

  findOne(
    ctx: AuthContext,
    { filters }: { filters?: FilterOrganizationInput }
  ): Promise<OrganizationEntityRecord> {
    return this.repository.catalogCrud(ctx).findOne({ filters });
  }

  findOneActive(
    ctx: AuthContext,
    { filters }: { filters?: FilterOrganizationInput }
  ): Promise<OrganizationEntityRecord> {
    return this.repository.catalogCrud(ctx).findOne({
      filters: this.withActiveFilter(filters),
    });
  }

  async findOneActiveById(
    ctx: AuthContext,
    id: string
  ): Promise<OrganizationEntityRecord> {
    const organization = await this.repository.catalogCrud(ctx).findOneById(id);
    this.assertActive(organization);
    return organization;
  }

  findManyById(
    ctx: AuthContext,
    ids: string[]
  ): Promise<OrganizationEntityRecord[]> {
    return this.repository.catalogCrud(ctx).findManyById(ids);
  }

  async findManyActiveById(
    ctx: AuthContext,
    ids: string[]
  ): Promise<OrganizationEntityRecord[]> {
    const organizations = await this.findManyById(ctx, ids);
    this.assertAllActive(organizations);
    return organizations;
  }

  findMany(
    ctx: AuthContext,
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
  ): Promise<MultiPaged<OrganizationEntityRecord>> {
    return this.repository
      .catalogCrud(ctx)
      .findMany({ filters, sort, skip, limit });
  }

  findManyActive(
    ctx: AuthContext,
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
  ): Promise<MultiPaged<OrganizationEntityRecord>> {
    return this.repository.catalogCrud(ctx).findMany({
      filters: this.withActiveFilter(filters),
      sort,
      skip,
      limit,
    });
  }

  createOne(
    ctx: AuthContext,
    createInput: CreateOrganizationInput
  ): Promise<OrganizationEntityRecord> {
    return this.repository.catalogCrud(ctx).createOne(createInput);
  }

  createMany(
    ctx: AuthContext,
    createInputs: CreateOrganizationInput[]
  ): Promise<BatchEntity> {
    return this.repository.catalogCrud(ctx).createMany(createInputs);
  }

  updateOne(
    ctx: AuthContext,
    id: string,
    updateInput: UpdateOrganizationInput
  ): Promise<OrganizationEntityRecord> {
    return this.repository.catalogCrud(ctx).updateOneById(id, updateInput);
  }

  updateMany(
    ctx: AuthContext,
    ids: string[],
    updateInput: UpdateOrganizationInput
  ): Promise<BatchEntity> {
    return this.repository.catalogCrud(ctx).updateManyById(ids, updateInput);
  }

  disableOne(ctx: AuthContext, id: string): Promise<OrganizationEntityRecord> {
    return this.repository
      .catalogCrud(ctx)
      .updateOneById(id, { disabled: true });
  }

  disableMany(ctx: AuthContext, ids: string[]): Promise<BatchEntity> {
    return this.repository
      .catalogCrud(ctx)
      .updateManyById(ids, { disabled: true });
  }

  enableOne(ctx: AuthContext, id: string): Promise<OrganizationEntityRecord> {
    return this.repository
      .catalogCrud(ctx)
      .updateOneById(id, { disabled: false });
  }

  enableMany(ctx: AuthContext, ids: string[]): Promise<BatchEntity> {
    return this.repository
      .catalogCrud(ctx)
      .updateManyById(ids, { disabled: false });
  }

  async removeOne(
    ctx: AuthContext,
    id: string
  ): Promise<OrganizationEntityRecord> {
    const organization = await this.repository.catalogCrud(ctx).findOneById(id);

    await this.eventEmitter.emitAsync(
      DomainEvents.organization.deleted,
      new OrganizationDeletedEvent(organization.id)
    );

    await this.repository.catalogCrud(ctx).deleteOneById(id);
    return organization;
  }

  async removeMany(ctx: AuthContext, ids: string[]): Promise<BatchEntity> {
    const organizations = await this.repository
      .catalogCrud(ctx)
      .findManyById(ids);

    for (const organization of organizations) {
      await this.eventEmitter.emitAsync(
        DomainEvents.organization.deleted,
        new OrganizationDeletedEvent(organization.id)
      );
    }

    return this.repository.catalogCrud(ctx).deleteManyById(ids);
  }

  count(ctx: AuthContext): Promise<number> {
    return this.repository.countActive(ctx);
  }

  countByField(ctx: AuthContext, field: string): Promise<FieldCount[]> {
    return this.repository.countByField(ctx, field);
  }

  async findRecentActivity(
    ctx: AuthContext,
    limit: number
  ): Promise<RecentActivityRecord[]> {
    const rows = await this.repository.findRecentlyUpdatedActive(
      ctx,
      limit,
      "name updatedAt"
    );
    return rows.map((row) => ({
      label: row.name as string,
      updatedAt: row.updatedAt,
    }));
  }

  private withActiveFilter(
    filters?: FilterOrganizationInput
  ): FilterOrganizationInput {
    return { ...filters, disabled: false };
  }

  private assertActive(entry: { disabled: boolean }): void {
    if (entry.disabled) {
      throw new NotFoundException(PERSISTENCE_NOT_FOUND);
    }
  }

  private assertAllActive(entries: Array<{ disabled: boolean }>): void {
    if (entries.some((entry) => entry.disabled)) {
      throw new NotFoundException(PERSISTENCE_NOT_FOUND);
    }
  }
}
