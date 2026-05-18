import { Prop, Schema } from "@nestjs/mongoose";

@Schema({ _id: false })
export class DateRangeModel {
  @Prop({ type: Date })
  from?: Date;

  @Prop({ type: Date })
  to?: Date;
}
