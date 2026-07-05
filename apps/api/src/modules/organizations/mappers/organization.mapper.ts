import {
  type AnyKeys,
  type QueryFilter,
  type SortOrder,
  type UpdateQuery,
} from "mongoose";
import { toBaseEntityFields, toIdString } from "@/core/mappers/base.mapper";
import { toTranslationEntityList } from "@/core/mappers/translation.mapper";
import { withObjectIdRefs } from "@/core/persistence/helpers/filter-ref.helper";
import { toPersistenceSort } from "@/core/persistence/helpers/sort-ref.helper";
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
      disabled: model.disabled,
      partition: model.partition,
      ownerId: toIdString(model.ownerId),
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
    return withObjectIdRefs(entity, { single: ["ownerId"] });
  }

  toPersistenceForSort(
    entity: SortOrganizationInput
  ): Record<keyof OrganizationModel, SortOrder> {
    return toPersistenceSort<SortOrganizationInput, OrganizationModel>(entity);
  }
}
