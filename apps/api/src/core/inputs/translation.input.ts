import { Type } from "@nestjs/common";
import { Field, InputType } from "@nestjs/graphql";
import { Type as TransformType } from "class-transformer";
import { IsNotEmpty, IsString, ValidateNested } from "class-validator";

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
    locale: string;

    @Field(() => MessagesModel)
    @ValidateNested()
    @TransformType(() => MessagesModel)
    messages: T;
  }

  return TranslationInputClass;
}
