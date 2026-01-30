import { Prop, Schema } from "@nestjs/mongoose";

@Schema({ _id: false })
export class UrlModel {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  value: string;
}
