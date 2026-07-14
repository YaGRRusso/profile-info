import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  EducationModel,
  EducationSchema,
} from "@/modules/educations/schemas/education.schema";
import { OrganizationsModule } from "@/modules/organizations/organizations.module";
import { SkillsModule } from "@/modules/skills/skills.module";
import { EducationsRepository } from "./educations.repository";
import { EducationsResolver } from "./educations.resolver";
import { EducationsService } from "./educations.service";
import { OnOrganizationDeletedListener } from "./listeners/on-organization-deleted.listener";
import { OnSkillDeletedListener } from "./listeners/on-skill-deleted.listener";
import { OnUserDeletedListener } from "./listeners/on-user-deleted.listener";

@Module({
  exports: [EducationsService],
  imports: [
    OrganizationsModule,
    SkillsModule,
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
    OnUserDeletedListener,
  ],
})
export class EducationsModule {}
