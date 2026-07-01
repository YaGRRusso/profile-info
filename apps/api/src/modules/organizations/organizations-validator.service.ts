import { Injectable } from "@nestjs/common";
import { assertReferencesResolved } from "@/common/helpers/assert.helper";
import { OrganizationsService } from "./organizations.service";

@Injectable()
export class OrganizationsValidatorService {
  constructor(private readonly organizationsService: OrganizationsService) {}

  assertOrganizationExists(organizationId: string): Promise<void> {
    return this.assertOrganizationsExist([organizationId]);
  }

  assertOrganizationsExist(organizationIds: string[]): Promise<void> {
    return assertReferencesResolved(organizationIds, (ids) =>
      this.organizationsService.findManyById(ids)
    );
  }
}
