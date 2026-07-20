import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { catalogPersistenceScope } from "@/core/context/auth-context.helper";
import type { AuthContext } from "@/core/context/auth-context.interface";
import { CatalogPartition } from "@/core/enums/catalog-partition.enum";
import { CrudRepository } from "@/core/persistence/repositories/crud/crud.repository";
import { StatsRepository } from "@/core/persistence/repositories/stats/stats.repository";
import type { FieldCount } from "@/core/persistence/types/output.type";
import { CreateOrganizationInput } from "./dto/create-organization.input";
import { FilterOrganizationInput } from "./dto/filter-organization.input";
import { SortOrganizationInput } from "./dto/sort-organization.input";
import { UpdateOrganizationInput } from "./dto/update-organization.input";
import type { OrganizationEntityRecord } from "./entities/organization.entity";
import { OrganizationMapper } from "./mappers/organization.mapper";
import { OrganizationModel } from "./schemas/organization.schema";

const NOT_DISABLED = { disabled: { $ne: true } } as const;

@Injectable()
export class OrganizationsRepository {
  private readonly crud: CrudRepository<
    OrganizationModel,
    OrganizationEntityRecord,
    CreateOrganizationInput,
    UpdateOrganizationInput,
    FilterOrganizationInput,
    SortOrganizationInput
  >;
  private readonly stats: StatsRepository<OrganizationModel>;
  private readonly model: Model<OrganizationModel>;

  constructor(
    @InjectModel(OrganizationModel.name)
    model: Model<OrganizationModel>
  ) {
    this.crud = new CrudRepository(model, new OrganizationMapper());
    this.stats = new StatsRepository(model);
    this.model = model;
  }

  catalogCrud(ctx: AuthContext) {
    return this.crud.scoped(catalogPersistenceScope(ctx));
  }

  catalogStats(ctx: AuthContext) {
    return this.stats.scoped(catalogPersistenceScope(ctx));
  }

  countActive(ctx: AuthContext): Promise<number> {
    return this.catalogStats(ctx).count(NOT_DISABLED);
  }

  countOwnedLocalActive(ctx: AuthContext): Promise<number> {
    return this.catalogStats(ctx).count({
      ...NOT_DISABLED,
      ownerId: ctx.id,
      partition: CatalogPartition.LOCAL,
    });
  }

  countByField(ctx: AuthContext, field: string): Promise<FieldCount[]> {
    return this.catalogStats(ctx).countByField(field, NOT_DISABLED);
  }

  findRecentlyUpdatedActive(
    ctx: AuthContext,
    limit: number,
    projection: string
  ) {
    return this.catalogStats(ctx).findRecentlyUpdated(
      limit,
      projection,
      NOT_DISABLED
    );
  }

  async purgeLocalByOwner(ownerId: string): Promise<void> {
    await this.model
      .deleteMany({ ownerId, partition: CatalogPartition.LOCAL })
      .exec();
  }
}
