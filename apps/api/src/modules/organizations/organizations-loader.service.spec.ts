import { Test, TestingModule } from "@nestjs/testing";
import { CatalogPartition } from "@/core/enums/catalog-partition.enum";
import { CredentialKind } from "@/core/enums/credential-kind.enum";
import { UserRole } from "@/core/enums/user-role.enum";
import { OrganizationsService } from "./organizations.service";
import { OrganizationsLoaderService } from "./organizations-loader.service";

const ownerId = "507f1f77bcf86cd799439011";
const organizationId = "507f1f77bcf86cd799439013";

const disabledOrganization = {
  category: "COMPANY",
  disabled: true,
  i18n: [],
  id: organizationId,
  name: "Legacy Org",
  partition: CatalogPartition.GLOBAL,
  slug: "legacy-org",
};

describe("OrganizationsLoaderService", () => {
  let loaderService: OrganizationsLoaderService;
  let organizationsService: { findManyById: jest.Mock };

  beforeEach(async () => {
    organizationsService = {
      findManyById: jest.fn().mockResolvedValue([disabledOrganization]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationsLoaderService,
        { provide: OrganizationsService, useValue: organizationsService },
      ],
    }).compile();

    loaderService = module.get(OrganizationsLoaderService);
  });

  it("resolves via owner-scoped session ctx (forced USER)", async () => {
    const loaders = loaderService.createLoader();

    await expect(loaders.forKey(ownerId).load(organizationId)).resolves.toEqual(
      disabledOrganization
    );

    expect(organizationsService.findManyById).toHaveBeenCalledWith(
      {
        credentialKind: CredentialKind.SESSION,
        id: ownerId,
        role: UserRole.USER,
      },
      [organizationId]
    );
  });

  it("returns null for ids not returned by findManyById", async () => {
    organizationsService.findManyById.mockResolvedValue([]);
    const loaders = loaderService.createLoader();

    await expect(
      loaders.forKey(ownerId).load(organizationId)
    ).resolves.toBeNull();
  });

  it("reuses the same DataLoader instance per owner within a request", () => {
    const loaders = loaderService.createLoader();
    expect(loaders.forKey(ownerId)).toBe(loaders.forKey(ownerId));
  });
});
