import type { TranslationEntity } from "@/core/entities/translation.entity";
import type { TranslationModel } from "@/core/schemas/translation.schema";

export function toTranslationEntity<TMessages>(
  model: TranslationModel<TMessages>
): TranslationEntity<TMessages> {
  return {
    locale: model.locale,
    messages: model.messages,
  };
}

export function toTranslationEntityList<TMessages>(
  models: TranslationModel<TMessages>[] | undefined
): TranslationEntity<TMessages>[] | undefined {
  return models?.map(toTranslationEntity);
}
