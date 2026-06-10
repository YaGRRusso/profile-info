import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  EducationModel,
  EducationSchema,
} from "@/modules/educations/schemas/education.schema";
import { EducationsRepository } from "./educations.repository";
import { EducationsResolver } from "./educations.resolver";
import { EducationsService } from "./educations.service";
import { OnOrganizationDeletedListener } from "./listeners/on-organization-deleted.listener";
import { OnSkillDeletedListener } from "./listeners/on-skill-deleted.listener";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EducationModel.name, schema: EducationSchema },
    ]),
  ],
  providers: [
    EducationsRepository,
    EducationsResolver,
    EducationsService,
    OnSkillDeletedListener,
    OnOrganizationDeletedListener,
  ],
  exports: [EducationsService],
})
export class EducationsModule {}
