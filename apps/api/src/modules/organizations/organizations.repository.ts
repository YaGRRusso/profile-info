import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { PERSISTENCE_NOT_FOUND } from "@/core/persistence/persistence.messages";
import { CrudRepository } from "@/core/persistence/repositories/crud/crud.repository";
import { StatsRepository } from "@/core/persistence/repositories/stats/stats.repository";
import type {
  FindManyQuery,
  FindOneQuery,
} from "@/core/persistence/types/input.type";
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

  findOneActive({ filters, ...query }: FindOneQuery<FilterOrganizationInput>) {
    return this.crud.findOne({
      ...query,
      filters: { ...filters, disabled: filters?.disabled ?? false },
    });
  }

  async findOneActiveById(id: string): Promise<OrganizationEntity> {
    const organization = await this.crud.findOneById(id);

    const isDisabled = organization.disabled;
    if (isDisabled) {
      throw new NotFoundException(PERSISTENCE_NOT_FOUND);
    }

    return organization;
  }

  findManyActive({
    filters,
    ...query
  }: FindManyQuery<FilterOrganizationInput, SortOrganizationInput>) {
    return this.crud.findMany({
      ...query,
      filters: { ...filters, disabled: filters?.disabled ?? false },
    });
  }

  async findManyActiveById(ids: string[]): Promise<OrganizationEntity[]> {
    const organizations = await this.crud.findManyById(ids);

    const isDisabled = organizations.some(
      (organization) => organization.disabled
    );
    if (isDisabled) {
      throw new NotFoundException(PERSISTENCE_NOT_FOUND);
    }

    return organizations;
  }

  countActive(): Promise<number> {
    return this.stats.count(NOT_DISABLED);
  }

  findRecentlyUpdatedActive(limit: number, projection: string) {
    return this.stats.findRecentlyUpdated(limit, projection, NOT_DISABLED);
  }
}
