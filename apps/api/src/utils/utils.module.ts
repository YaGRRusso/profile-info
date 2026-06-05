import { Global, Module } from "@nestjs/common";
import { GithubService } from "./github.service";
import { OrchestratorService } from "./orchestrator.service";
import { WebSearchService } from "./web-search.service";

@Global()
@Module({
  providers: [OrchestratorService, WebSearchService, GithubService],
  exports: [OrchestratorService, WebSearchService, GithubService],
})
export class OrchestratorModule {}
