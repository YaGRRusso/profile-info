import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SkillModel, SkillSchema } from "@/modules/skills/schemas/skill.schema";
import { SkillsRepository } from "./skills.repository";
import { SkillsResolver } from "./skills.resolver";
import { SkillsService } from "./skills.service";
import { SkillsLoaderService } from "./skills-loader.service";
import { SkillsValidatorService } from "./skills-validator.service";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SkillModel.name, schema: SkillSchema }]),
  ],
  providers: [
    SkillsRepository,
    SkillsResolver,
    SkillsService,
    SkillsLoaderService,
    SkillsValidatorService,
  ],
  exports: [SkillsService, SkillsLoaderService, SkillsValidatorService],
})
export class SkillsModule {}
