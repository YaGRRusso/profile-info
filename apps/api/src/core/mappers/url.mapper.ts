import type { UrlEntity } from "@/core/entities/url.entity";
import type { UrlModel } from "@/core/schemas/url.schema";

export function toUrlEntity(model: UrlModel): UrlEntity {
  return {
    title: model.title,
    value: model.value,
  };
}

export function toUrlEntityList(
  models: UrlModel[] | undefined
): UrlEntity[] | undefined {
  return models?.map(toUrlEntity);
}
