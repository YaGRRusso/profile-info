import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ExperienceModel, ExperienceSchema } from "@/schemas/experience.schema";
import {
  ExperienceRoleResolver,
  ExperiencesResolver,
} from "./experiences.resolver";
import { ExperiencesService } from "./experiences.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ExperienceModel.name, schema: ExperienceSchema },
    ]),
  ],
  providers: [ExperiencesResolver, ExperienceRoleResolver, ExperiencesService],
})
export class ExperiencesModule {}
