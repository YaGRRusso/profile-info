import { Injectable } from "@nestjs/common";
import DataLoader from "dataloader";
import { keyBy } from "lodash";
import { OrganizationEntity } from "./entities/organization.entity";
import { OrganizationsService } from "./organizations.service";

@Injectable()
export class OrganizationsLoaderService {
  constructor(private readonly organizationsService: OrganizationsService) {}

  createLoader() {
    return new DataLoader<string, OrganizationEntity | null>(
      async (ids) => {
        const list = await this.organizationsService.findManyById([...ids]);
        const map = keyBy(list, (item) => item.id);
        return ids.map((id) => map[id] ?? null);
      },
      { name: "batchOrganizations", maxBatchSize: 100 }
    );
  }
}
