import { Prop, Schema } from "@nestjs/mongoose";

@Schema()
export class BaseModel {
  // virtuals
  _id: string;
  id: string;

  @Prop({ default: Date.now, required: true, type: Date })
  createdAt: Date;

  @Prop({ default: Date.now, required: true, type: Date })
  updatedAt: Date;
}
