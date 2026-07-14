import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { type HydratedDocument } from "mongoose";
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

  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: true, type: String, unique: true })
  nickname: string;

  @Prop({ type: String })
  phone?: string;

  @Prop({ required: true, type: String, unique: true })
  email: string;

  @Prop({ required: true, select: false, type: String })
  password: string;

  @Prop({ type: Date })
  birth?: Date;

  @Prop({ type: String })
  address?: string;

  @Prop({ type: [createTranslationModel(UserMessagesModel)] })
  i18n?: TranslationModel<UserMessagesModel>[];

  @Prop({ default: false, index: true, required: true, type: Boolean })
  disabled: boolean;

  @Prop({ default: UserRole.USER, enum: UserRole, type: String })
  role?: UserRole;

  @Prop({ type: [{ type: SchemaFactory.createForClass(UrlModel) }] })
  urls?: UrlModel[];

  @Prop({
    type: [{ ref: "SkillModel", type: mongoose.Schema.Types.ObjectId }],
  })
  skillIds?: (mongoose.Types.ObjectId | string)[];
}

export type UserDocument = HydratedDocument<UserModel>;
export const UserSchema = SchemaFactory.createForClass(UserModel);
