import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

@Schema({ timestamps: true })
export class OrganizationModel {
  @Prop({ type: String, required: true, unique: true })
  slug: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  url: string;

  @Prop({ type: String, required: true })
  thumbnail: string;

  @Prop({ type: String, required: true })
  category: string;
}

export type OrganizationDocument = HydratedDocument<OrganizationModel>;
export const OrganizationSchema =
  SchemaFactory.createForClass(OrganizationModel);
