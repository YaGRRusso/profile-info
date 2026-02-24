import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { EducationModel, EducationSchema } from "@/schemas/education.schema";
import { EducationsResolver } from "./educations.resolver";
import { EducationsService } from "./educations.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EducationModel.name, schema: EducationSchema },
    ]),
  ],
  providers: [EducationsResolver, EducationsService],
})
export class EducationsModule {}
