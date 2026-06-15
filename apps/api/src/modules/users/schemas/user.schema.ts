import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import type { HydratedDocument } from "mongoose";
import { UserRole } from "@/core/enums/user-role.enum";
import { BaseModel } from "@/core/schemas/base.schema";
import {
  createTranslationModel,
  TranslationModel,
} from "@/core/schemas/translation.schema";
import { UrlModel } from "@/core/schemas/url.schema";

@Schema({ _id: false })
export class UserMessagesModel {
  @Prop({ type: String })
  title?: string;

  @Prop({ type: String })
  description?: string;
}

@Schema({ timestamps: true })
export class UserModel extends BaseModel {
  @Prop({ type: String })
  avatar?: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true, unique: true })
  nickname: string;

  @Prop({ type: String })
  phone?: string;

  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({ type: String, required: true, select: false })
  password: string;

  @Prop({ type: Date })
  birth?: Date;

  @Prop({ type: String })
  address?: string;

  @Prop({ type: [createTranslationModel(UserMessagesModel)] })
  i18n?: TranslationModel<UserMessagesModel>[];

  @Prop({ type: String, enum: UserRole, default: UserRole.USER })
  role?: UserRole;

  @Prop({ type: [{ type: SchemaFactory.createForClass(UrlModel) }] })
  urls?: UrlModel[];
}

export type UserDocument = HydratedDocument<UserModel>;
export const UserSchema = SchemaFactory.createForClass(UserModel);
