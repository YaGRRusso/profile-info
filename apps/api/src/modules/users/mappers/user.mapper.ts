import {
  type AnyKeys,
  type QueryFilter,
  type SortOrder,
  type UpdateQuery,
} from "mongoose";
import { toBaseEntityFields } from "@/core/mappers/base.mapper";
import { toTranslationEntityList } from "@/core/mappers/translation.mapper";
import { toUrlEntityList } from "@/core/mappers/url.mapper";
import { withObjectIdRefs } from "@/core/persistence/helpers/filter-ref.helper";
import type { CrudMapperInterface } from "@/core/persistence/repositories/crud/crud.interface";
import { CreateUserInput } from "../dto/create-user.input";
import { FilterUserInput } from "../dto/filter-user.input";
import { SortUserInput } from "../dto/sort-user.input";
import { UpdateUserInput } from "../dto/update-user.input";
import type { UserEntity } from "../entities/user.entity";
import type { UserModel } from "../schemas/user.schema";

export type UserCreateRecord = Omit<CreateUserInput, "password"> & {
  password: string;
};

export type UserUpdateRecord = Omit<UpdateUserInput, "password"> & {
  password?: string;
};

export class UserMapper
  implements
    CrudMapperInterface<
      UserEntity,
      UserModel,
      UserCreateRecord,
      UserUpdateRecord,
      FilterUserInput,
      SortUserInput
    >
{
  toDomain(model: UserModel): UserEntity {
    return {
      ...toBaseEntityFields(model),
      avatar: model.avatar,
      name: model.name,
      nickname: model.nickname,
      phone: model.phone,
      email: model.email,
      birth: model.birth,
      address: model.address,
      i18n: toTranslationEntityList(model.i18n),
      role: model.role,
      urls: toUrlEntityList(model.urls),
    };
  }

  toPersistenceForCreate(entity: UserCreateRecord): AnyKeys<UserModel> {
    return { ...entity };
  }

  toPersistenceForUpdate(entity: UserUpdateRecord): UpdateQuery<UserModel> {
    return { ...entity };
  }

  toPersistenceForFilter(entity: FilterUserInput): QueryFilter<UserModel> {
    return withObjectIdRefs(entity, {});
  }

  toPersistenceForSort(
    entity: SortUserInput
  ): Record<keyof UserModel, SortOrder> {
    return { ...entity } as Record<keyof UserModel, SortOrder>;
  }
}
