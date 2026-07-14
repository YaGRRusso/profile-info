import { Type } from "@nestjs/common";
import { Field, ObjectType } from "@nestjs/graphql";

export interface TranslationEntity<T> {
  locale: string;
  messages: T;
}

export function createTranslationEntity<T>(
  MessagesModel: Type<T>
): Type<TranslationEntity<T>> {
  const { name } = MessagesModel;

  @ObjectType(`${name}TranslationEntity`, { isAbstract: true })
  class TranslationEntityClass {
    @Field(() => String)
    locale: string;

    @Field(() => MessagesModel)
    messages: T;
  }

  return TranslationEntityClass;
}
