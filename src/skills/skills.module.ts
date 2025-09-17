import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SkillModel, SkillSchema } from "@/schemas/skill.schema";
import { SkillsResolver } from "./skills.resolver";
import { SkillsService } from "./skills.service";

@Module({
  imports: [MongooseModule.forFeature([{ name: SkillModel.name, schema: SkillSchema }])],
  providers: [SkillsResolver, SkillsService],
  exports: [SkillsService],
})
export class SkillsModule {}
