import { Injectable } from "@nestjs/common";
import DataLoader from "dataloader";
import { keyBy } from "lodash";
import type { AuthContext } from "@/core/context/auth-context.interface";
import type { OrganizationEntity } from "./entities/organization.entity";
import { OrganizationsService } from "./organizations.service";

@Injectable()
export class OrganizationsLoaderService {
  constructor(private readonly organizationsService: OrganizationsService) {}

  createLoader(ctx?: AuthContext) {
    if (!ctx) {
      return new DataLoader<string, OrganizationEntity | null>(
        async (ids) => ids.map(() => null),
        { name: "batchOrganizations", maxBatchSize: 100 }
      );
    }

    return new DataLoader<string, OrganizationEntity | null>(
      async (ids) => {
        const list = await this.organizationsService.findManyById(ctx, [
          ...ids,
        ]);
        const map = keyBy(list, (item) => item.id);
        return ids.map((id) => map[id] ?? null);
      },
      { name: "batchOrganizations", maxBatchSize: 100 }
    );
  }
}
