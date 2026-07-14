import { Type } from "@nestjs/common";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export interface TranslationModel<T> {
  locale: string;
  messages: T;
}

export function createTranslationModel<T>(MessagesModel: Type<T>) {
  @Schema({ _id: false })
  class TranslationModelClass implements TranslationModel<T> {
    @Prop({ required: true, type: String })
    locale: string;

    @Prop({ required: true, type: SchemaFactory.createForClass(MessagesModel) })
    messages: T;
  }

  return SchemaFactory.createForClass(TranslationModelClass);
}
