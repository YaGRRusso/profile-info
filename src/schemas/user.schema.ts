import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

@Schema({ _id: false })
export class UrlModel {
  @Prop({ required: true })
  code: string;

  @Prop({ required: true })
  value: string;
}

@Schema({ timestamps: true })
export class UserModel {
  @Prop({ type: String })
  avatar?: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true, unique: true })
  nickname: string;

  @Prop({ type: String })
  title?: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: String })
  phone?: string;

  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: String })
  birthDate?: Date;

  @Prop({ type: String })
  address?: string;

  @Prop({ type: String })
  postalCode?: string;

  @Prop({ type: String })
  school?: string;

  @Prop({ type: String })
  work?: string;

  @Prop({ type: String, default: "USER" })
  role?: string;

  @Prop({ type: [String] })
  hobbies?: string[];

  @Prop({
    type: [{ type: SchemaFactory.createForClass(UrlModel) }],
  })
  urls?: UrlModel[];
}

export type UserDocument = HydratedDocument<UserModel>;
export const UserSchema = SchemaFactory.createForClass(UserModel);
