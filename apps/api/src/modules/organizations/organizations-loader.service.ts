import { Injectable } from "@nestjs/common";
import DataLoader from "dataloader";
import { keyBy } from "lodash";
import { OrganizationModel } from "@/modules/organizations/schemas/organization.schema";
import { OrganizationsService } from "./organizations.service";

@Injectable()
export class OrganizationsLoaderService {
  constructor(private readonly organizationsService: OrganizationsService) {}

  createLoader() {
    return new DataLoader<string, OrganizationModel | null>(
      async (ids) => {
        const list = await this.organizationsService.findManyById([...ids]);
        const map = keyBy(list, (item) => item.id.toString());
        return ids.map((id) => map[id] ?? null);
      },
      { name: "batchOrganizations", maxBatchSize: 100 }
    );
  }
}
