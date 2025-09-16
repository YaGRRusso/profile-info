import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

@Schema({ timestamps: true })
export class SkillModel {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  category: string;
}

export type SkillDocument = HydratedDocument<SkillModel>;
export const SkillSchema = SchemaFactory.createForClass(SkillModel);
