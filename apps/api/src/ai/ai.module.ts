import { Module } from "@nestjs/common";
import { AiResolver } from "./ai.resolver";
import { AiService } from "./ai.service";
import { ResourceDetailService } from "./details.service";

@Module({
  imports: [],
  providers: [AiResolver, AiService, ResourceDetailService],
})
export class AiModule {}
