import { toBaseEntityFields } from "@/core/mappers/base.mapper";
import { toTranslationEntityList } from "@/core/mappers/translation.mapper";
import { toUrlEntityList } from "@/core/mappers/url.mapper";
import type { UserEntity } from "../entities/user.entity";
import type { UserModel } from "../schemas/user.schema";

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
