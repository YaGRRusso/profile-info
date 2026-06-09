import { Injectable } from "@nestjs/common";
import { RepositoryMetadataProvider } from "@/integrations/github/repository-metadata.provider";
import type { DetailInput } from "../../dto/detail.input";
import { ResourceType } from "../../enums/resource-type";
import type { ResourceExtractor } from "../resource-extractor.interface";

@Injectable()
export class GithubResourceExtractorService implements ResourceExtractor {
  readonly supportedTypes = [ResourceType.PROJECT];
  readonly supportedKeys = ["urls", "links", "references", "resources"];

  constructor(
    private readonly repositoryMetadataProvider: RepositoryMetadataProvider
  ) {}

  accepts(value: string): boolean {
    return value.includes("github.com");
  }

  async extract(url: string): Promise<DetailInput[]> {
    const extraDetails: DetailInput[] = [];

    const { owner, repo } =
      this.repositoryMetadataProvider.getRepositoryMeta(url);

    const { description, languages, readme, topics } =
      await this.repositoryMetadataProvider.getRepositoryData(owner, repo);

    extraDetails.push({
      key: "languages",
      value: Object.keys(languages),
    });

    if (description) {
      extraDetails.push({
        key: "description",
        value: [description],
      });
    }

    if (topics.length > 0) {
      extraDetails.push({
        key: "topics",
        value: topics,
      });
    }

    if (readme && typeof readme === "string") {
      extraDetails.push({
        key: "readme",
        value: [readme],
      });
    }

    return extraDetails;
  }
}
