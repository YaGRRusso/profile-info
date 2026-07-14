import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  ExperienceModel,
  ExperienceSchema,
} from "@/modules/experiences/schemas/experience.schema";
import { OrganizationsModule } from "@/modules/organizations/organizations.module";
import { SkillsModule } from "@/modules/skills/skills.module";
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
  exports: [ExperiencesService],
  imports: [
    OrganizationsModule,
    SkillsModule,
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
})
export class ExperiencesModule {}
