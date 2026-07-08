import { Injectable } from "@nestjs/common";
import { assertReferencesResolved } from "@/common/helpers/assert.helper";
import type { AuthContext } from "@/core/context/auth-context.interface";
import { OrganizationsService } from "./organizations.service";

@Injectable()
export class OrganizationsValidatorService {
  constructor(private readonly organizationsService: OrganizationsService) {}

  assertOrganizationEnabled(
    ctx: AuthContext,
    organizationId: string
  ): Promise<void> {
    return this.assertOrganizationsEnabled(ctx, [organizationId]);
  }

  assertOrganizationsEnabled(
    ctx: AuthContext,
    organizationIds: string[]
  ): Promise<void> {
    return assertReferencesResolved(organizationIds, (ids) =>
      this.organizationsService.findManyActiveById(ctx, ids)
    );
  }
}
