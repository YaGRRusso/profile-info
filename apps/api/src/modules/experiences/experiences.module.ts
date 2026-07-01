import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  ExperienceModel,
  ExperienceSchema,
} from "@/modules/experiences/schemas/experience.schema";
import { ExperiencesRepository } from "./experiences.repository";
import {
  ExperienceRoleResolver,
  ExperiencesResolver,
} from "./experiences.resolver";
import { ExperiencesService } from "./experiences.service";
import { OnOrganizationDeletedListener } from "./listeners/on-organization-deleted.listener";
import { OnSkillDeletedListener } from "./listeners/on-skill-deleted.listener";
import { OnUserDeletedListener } from "./listeners/on-user-deleted.listener";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ExperienceModel.name, schema: ExperienceSchema },
    ]),
  ],
  providers: [
    ExperiencesRepository,
    ExperiencesResolver,
    ExperienceRoleResolver,
    ExperiencesService,
    OnSkillDeletedListener,
    OnOrganizationDeletedListener,
    OnUserDeletedListener,
  ],
  exports: [ExperiencesService],
})
export class ExperiencesModule {}
