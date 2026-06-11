import { Type } from "@nestjs/common";
import { Field, InputType } from "@nestjs/graphql";
import { IsIn, IsNotEmpty, IsString } from "class-validator";
import { SUPPORTED_CONTENT_LOCALES } from "@/common/i18n/locales";

export interface TranslationInput<T> {
  locale: string;
  messages: T;
}

export function createTranslationInput<T>(
  MessagesModel: Type<T>
): Type<TranslationInput<T>> {
  const name = MessagesModel.name;

  @InputType(`${name}TranslationInput`, { isAbstract: true })
  class TranslationInputClass {
    @Field(() => String)
    @IsString()
    @IsNotEmpty()
    @IsIn([...SUPPORTED_CONTENT_LOCALES])
    locale: string;

    @Field(() => MessagesModel)
    messages: T;
  }

  return TranslationInputClass;
}
