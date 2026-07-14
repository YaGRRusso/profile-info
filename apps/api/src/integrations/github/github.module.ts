import { Module } from "@nestjs/common";
import { GithubService } from "./github.service";
import { RepositoryMetadataProvider } from "./repository-metadata.provider";

@Module({
  exports: [RepositoryMetadataProvider],
  providers: [
    GithubService,
    { provide: RepositoryMetadataProvider, useClass: GithubService },
  ],
})
export class GithubModule {}
