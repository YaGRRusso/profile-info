import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

@Schema({ timestamps: true })
export class OrganizationModel {
  @Prop({ type: String, required: true, unique: true })
  slug: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  website: string;

  @Prop({ type: String, required: true })
  logo: string;

  @Prop({ type: String, required: true })
  category: string;
}

export type OrganizationDocument = HydratedDocument<OrganizationModel>;
export const OrganizationSchema =
  SchemaFactory.createForClass(OrganizationModel);
