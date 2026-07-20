import { Injectable } from "@nestjs/common";
import DataLoader from "dataloader";
import { keyBy } from "lodash";
import { toSessionAuthContext } from "@/core/context/auth-context.helper";
import { UserRole } from "@/core/enums/user-role.enum";
import {
  createKeyedLoaderCache,
  type KeyedLoader,
} from "@/core/loaders/keyed-loader-cache";
import type { OrganizationEntityRecord } from "./entities/organization.entity";
import { OrganizationsService } from "./organizations.service";

@Injectable()
export class OrganizationsLoaderService {
  constructor(private readonly organizationsService: OrganizationsService) {}

  createLoader(): KeyedLoader<OrganizationEntityRecord> {
    return createKeyedLoaderCache((ownerId) => {
      const ctx = toSessionAuthContext({
        id: ownerId,
        role: UserRole.USER,
      });

      return new DataLoader<string, OrganizationEntityRecord | null>(
        async (ids) => {
          const list = await this.organizationsService.findManyById(ctx, [
            ...ids,
          ]);
          const map = keyBy(list, (item) => item.id);
          return ids.map((id) => map[id] ?? null);
        },
        { maxBatchSize: 100, name: `batchOrganizations:${ownerId}` }
      );
    });
  }
}
