import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  ExperienceModel,
  ExperienceSchema,
} from "@/modules/experiences/schemas/experience.schema";
import {
  ExperienceRoleResolver,
  ExperiencesResolver,
} from "./experiences.resolver";
import { ExperiencesService } from "./experiences.service";
import { OnOrganizationDeletedListener } from "./listeners/on-organization-deleted.listener";
import { OnSkillDeletedListener } from "./listeners/on-skill-deleted.listener";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ExperienceModel.name, schema: ExperienceSchema },
    ]),
  ],
  providers: [
    ExperiencesResolver,
    ExperienceRoleResolver,
    ExperiencesService,
    OnSkillDeletedListener,
    OnOrganizationDeletedListener,
  ],
  exports: [ExperiencesService],
})
export class ExperiencesModule {}
