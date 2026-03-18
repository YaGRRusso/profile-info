import { Prop, Schema } from "@nestjs/mongoose";

@Schema()
export class BaseModel {
  // virtuals
  _id: string;
  id: string;

  @Prop({ type: Date, required: true })
  createdAt: Date;

  @Prop({ type: Date, required: true })
  updatedAt: Date;
}
