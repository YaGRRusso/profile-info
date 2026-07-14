import { Type } from "@nestjs/common";
import { InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsString } from "class-validator";
import { RequiredField } from "@/core/decorators/required-field.decorator";

export interface TranslationInput<T> {
  locale: string;
  messages: T;
}

export function createTranslationInput<T>(
  MessagesModel: Type<T>
): Type<TranslationInput<T>> {
  const { name } = MessagesModel;

  @InputType(`${name}TranslationInput`, { isAbstract: true })
  class TranslationInputClass {
    @RequiredField(() => String)
    @IsString()
    @IsNotEmpty()
    locale: string;

    @RequiredField(() => MessagesModel)
    messages: T;
  }

  return TranslationInputClass;
}
