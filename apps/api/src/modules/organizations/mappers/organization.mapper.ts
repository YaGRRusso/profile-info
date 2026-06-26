import {
  type AnyKeys,
  type QueryFilter,
  type SortOrder,
  type UpdateQuery,
} from "mongoose";
import { toBaseEntityFields } from "@/core/mappers/base.mapper";
import { toTranslationEntityList } from "@/core/mappers/translation.mapper";
import type { CrudMapperInterface } from "@/core/persistence/repositories/crud/crud.interface";
import { CreateOrganizationInput } from "../dto/create-organization.input";
import { FilterOrganizationInput } from "../dto/filter-organization.input";
import { SortOrganizationInput } from "../dto/sort-organization.input";
import { UpdateOrganizationInput } from "../dto/update-organization.input";
import type { OrganizationEntity } from "../entities/organization.entity";
import type { OrganizationCategory } from "../enums/category.enum";
import type { OrganizationModel } from "../schemas/organization.schema";

export class OrganizationMapper
  implements
    CrudMapperInterface<
      OrganizationEntity,
      OrganizationModel,
      CreateOrganizationInput,
      UpdateOrganizationInput,
      FilterOrganizationInput,
      SortOrganizationInput
    >
{
  toDomain(model: OrganizationModel): OrganizationEntity {
    return {
      ...toBaseEntityFields(model),
      relevance: model.relevance,
      slug: model.slug,
      name: model.name,
      website: model.website,
      logo: model.logo,
      i18n:
        toTranslationEntityList(model.i18n)?.map((entry) => ({
          locale: entry.locale,
          messages: { description: entry.messages.description },
        })) ?? [],
      category: model.category as OrganizationCategory,
    };
  }

  toPersistenceForCreate(
    entity: CreateOrganizationInput
  ): AnyKeys<OrganizationModel> {
    return { ...entity };
  }

  toPersistenceForUpdate(
    entity: UpdateOrganizationInput
  ): UpdateQuery<OrganizationModel> {
    return { ...entity };
  }

  toPersistenceForFilter(
    entity: FilterOrganizationInput
  ): QueryFilter<OrganizationModel> {
    return { ...entity } as QueryFilter<OrganizationModel>;
  }

  toPersistenceForSort(
    entity: SortOrganizationInput
  ): Record<keyof OrganizationModel, SortOrder> {
    return { ...entity } as Record<keyof OrganizationModel, SortOrder>;
  }
}
