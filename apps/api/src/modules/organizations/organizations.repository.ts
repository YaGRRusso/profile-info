import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { catalogPersistenceScope } from "@/core/context/auth-context.helper";
import type { AuthContext } from "@/core/context/auth-context.interface";
import { CrudRepository } from "@/core/persistence/repositories/crud/crud.repository";
import { StatsRepository } from "@/core/persistence/repositories/stats/stats.repository";
import { CreateOrganizationInput } from "./dto/create-organization.input";
import { FilterOrganizationInput } from "./dto/filter-organization.input";
import { SortOrganizationInput } from "./dto/sort-organization.input";
import { UpdateOrganizationInput } from "./dto/update-organization.input";
import type { OrganizationEntity } from "./entities/organization.entity";
import { OrganizationMapper } from "./mappers/organization.mapper";
import { OrganizationModel } from "./schemas/organization.schema";

const NOT_DISABLED = { disabled: { $ne: true } } as const;

@Injectable()
export class OrganizationsRepository {
  readonly crud: CrudRepository<
    OrganizationModel,
    OrganizationEntity,
    CreateOrganizationInput,
    UpdateOrganizationInput,
    FilterOrganizationInput,
    SortOrganizationInput
  >;
  readonly stats: StatsRepository<OrganizationModel>;

  constructor(
    @InjectModel(OrganizationModel.name) model: Model<OrganizationModel>
  ) {
    this.crud = new CrudRepository(model, new OrganizationMapper());
    this.stats = new StatsRepository(model);
  }

  catalogCrud(ctx: AuthContext) {
    return this.crud.scoped(catalogPersistenceScope(ctx));
  }

  catalogStats(ctx: AuthContext) {
    return this.stats.scoped(catalogPersistenceScope(ctx));
  }

  countActive(): Promise<number> {
    return this.stats.count(NOT_DISABLED);
  }

  findRecentlyUpdatedActive(limit: number, projection: string) {
    return this.stats.findRecentlyUpdated(limit, projection, NOT_DISABLED);
  }
}
