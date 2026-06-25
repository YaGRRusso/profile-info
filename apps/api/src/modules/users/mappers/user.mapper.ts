import {
  toBaseEntityFields,
  toBaseModelFields,
} from "@/core/mappers/base.mapper";
import {
  toTranslationEntityList,
  toTranslationModelList,
} from "@/core/mappers/translation.mapper";
import { toUrlEntityList, toUrlModelList } from "@/core/mappers/url.mapper";
import type { UserEntity } from "../entities/user.entity";
import type { UserModel } from "../schemas/user.schema";

export type UserPersistence = Omit<UserModel, "_id" | "password"> & {
  password?: string;
};

export function toUserEntity(model: UserModel): UserEntity {
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

export function toUserModel(
  entity: UserEntity,
  extra: { password?: string } = {}
): UserPersistence {
  return {
    ...toBaseModelFields(entity),
    avatar: entity.avatar,
    name: entity.name,
    nickname: entity.nickname,
    phone: entity.phone,
    email: entity.email,
    birth: entity.birth,
    address: entity.address,
    i18n: toTranslationModelList(entity.i18n),
    role: entity.role,
    urls: toUrlModelList(entity.urls),
    ...extra,
  };
}
