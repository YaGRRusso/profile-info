import {
  type AnyKeys,
  type QueryFilter,
  type SortOrder,
  type UpdateQuery,
} from "mongoose";
import {
  toBaseEntityFields,
  toIdStrings,
  toObjectIds,
} from "@/core/mappers/base.mapper";
import { toTranslationEntityList } from "@/core/mappers/translation.mapper";
import { toUrlEntityList } from "@/core/mappers/url.mapper";
import { withObjectIdRefs } from "@/core/persistence/helpers/filter-ref.helper";
import { toPersistenceSort } from "@/core/persistence/helpers/sort-ref.helper";
import type { CrudMapperInterface } from "@/core/persistence/repositories/crud/crud.interface";
import { CreateUserInput } from "../dto/create-user.input";
import { FilterUserInput } from "../dto/filter-user.input";
import { SortUserInput } from "../dto/sort-user.input";
import { UpdateUserInput } from "../dto/update-user.input";
import type { UserEntityRecord } from "../entities/user.entity";
import type { UserModel } from "../schemas/user.schema";

export type UserCreateRecord = Omit<CreateUserInput, "password"> & {
  password: string;
  disabled?: boolean;
};

export type UserUpdateRecord = Omit<UpdateUserInput, "password"> & {
  password?: string;
  disabled?: boolean;
};

export class UserMapper
  implements
    CrudMapperInterface<
      UserEntityRecord,
      UserModel,
      UserCreateRecord,
      UserUpdateRecord,
      FilterUserInput,
      SortUserInput
    >
{
  toDomain(model: UserModel): UserEntityRecord {
    return {
      ...toBaseEntityFields(model),
      address: model.address,
      avatar: model.avatar,
      birth: model.birth,
      disabled: model.disabled ?? false,
      email: model.email,
      i18n: toTranslationEntityList(model.i18n),
      locale: model.locale,
      locales: model.locales,
      name: model.name,
      nickname: model.nickname,
      phone: model.phone,
      role: model.role,
      skillIds: toIdStrings(model.skillIds),
      urls: toUrlEntityList(model.urls),
    };
  }

  toPersistenceForCreate(entity: UserCreateRecord): AnyKeys<UserModel> {
    return {
      ...entity,
      skillIds: toObjectIds(entity.skillIds),
    };
  }

  toPersistenceForUpdate(entity: UserUpdateRecord): UpdateQuery<UserModel> {
    return {
      ...entity,
      skillIds: toObjectIds(entity.skillIds),
    };
  }

  toPersistenceForFilter(entity: FilterUserInput): QueryFilter<UserModel> {
    return withObjectIdRefs(entity, {});
  }

  toPersistenceForSort(
    entity: SortUserInput
  ): Record<keyof UserModel, SortOrder> {
    return toPersistenceSort<SortUserInput, UserModel>(entity);
  }
}
