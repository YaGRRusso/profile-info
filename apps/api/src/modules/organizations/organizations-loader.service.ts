import { Injectable, UnauthorizedException } from "@nestjs/common";
import DataLoader from "dataloader";
import { keyBy } from "lodash";
import { AUTH_UNAUTHORIZED } from "@/core/auth/auth.messages";
import type { AppRequest } from "@/core/context/graphql-context.interface";
import type { OrganizationEntityRecord } from "./entities/organization.entity";
import { OrganizationsService } from "./organizations.service";

@Injectable()
export class OrganizationsLoaderService {
  constructor(private readonly organizationsService: OrganizationsService) {}

  createLoader(req: AppRequest) {
    return new DataLoader<string, OrganizationEntityRecord | null>(
      async (ids) => {
        const ctx = req.user;
        if (!ctx) {
          throw new UnauthorizedException(AUTH_UNAUTHORIZED);
        }

        const list = await this.organizationsService.findManyById(ctx, [
          ...ids,
        ]);
        const map = keyBy(list, (item) => item.id);
        return ids.map((id) => map[id] ?? null);
      },
      { maxBatchSize: 100, name: "batchOrganizations" }
    );
  }
}
