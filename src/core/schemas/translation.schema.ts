import { Type } from "@nestjs/common";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export interface TranslationModel<T> {
  locale: string;
  messages: T;
}

export function createTranslationModel<T>(MessagesModel: Type<T>) {
  @Schema({ _id: false })
  class TranslationModelClass implements TranslationModel<T> {
    @Prop({ type: String, required: true })
    locale: string;

    @Prop({ type: SchemaFactory.createForClass(MessagesModel), required: true })
    messages: T;
  }

  return SchemaFactory.createForClass(TranslationModelClass);
}
