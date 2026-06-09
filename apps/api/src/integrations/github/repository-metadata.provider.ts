export interface RepositoryOwnerRepo {
  owner: string;
  repo: string;
}

export interface RepositoryData {
  description: string | null;
  languages: Record<string, number>;
  readme: string | unknown;
  topics: string[];
}

export abstract class RepositoryMetadataProvider {
  abstract getRepositoryMeta(path: string): RepositoryOwnerRepo;
  abstract getRepositoryData(
    owner: string,
    repo: string
  ): Promise<RepositoryData>;
}
