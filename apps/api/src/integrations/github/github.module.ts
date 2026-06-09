import { Module } from "@nestjs/common";
import { GithubService } from "./github.service";
import { RepositoryMetadataProvider } from "./repository-metadata.provider";

@Module({
  providers: [
    GithubService,
    { provide: RepositoryMetadataProvider, useClass: GithubService },
  ],
  exports: [RepositoryMetadataProvider],
})
export class GithubModule {}
