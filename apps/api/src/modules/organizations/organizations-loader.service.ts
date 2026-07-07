import { Injectable, UnauthorizedException } from "@nestjs/common";
import DataLoader from "dataloader";
import { keyBy } from "lodash";
import type { AuthContext } from "@/core/context/auth-context.interface";
import type { OrganizationEntity } from "./entities/organization.entity";
import { OrganizationsService } from "./organizations.service";

@Injectable()
export class OrganizationsLoaderService {
  constructor(private readonly organizationsService: OrganizationsService) {}

  createLoader(resolveCtx: () => AuthContext | undefined) {
    return new DataLoader<string, OrganizationEntity | null>(
      async (ids) => {
        const ctx = resolveCtx();
        if (!ctx) {
          throw new UnauthorizedException();
        }

        const list = await this.organizationsService.findManyActiveById(ctx, [
          ...ids,
        ]);
        const map = keyBy(list, (item) => item.id);
        return ids.map((id) => map[id] ?? null);
      },
      { name: "batchOrganizations", maxBatchSize: 100 }
    );
  }
}
