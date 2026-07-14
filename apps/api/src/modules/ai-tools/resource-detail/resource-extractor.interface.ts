import type { DetailInput } from "../dto/detail.input";
import type { ResourceType } from "../enums/resource-type";

export interface ResourceExtractor {
  accepts: (value: string) => boolean;
  extract: (value: string) => Promise<DetailInput[]>;
  readonly supportedKeys: string[];
  readonly supportedTypes?: ResourceType[];
}
