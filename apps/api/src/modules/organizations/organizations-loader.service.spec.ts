import { UnauthorizedException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { testAuthContext } from "@test/fixtures/auth-context";
import type { AppRequest } from "@/core/context/graphql-context.interface";
import { CatalogPartition } from "@/core/enums/catalog-partition.enum";
import { OrganizationsService } from "./organizations.service";
import { OrganizationsLoaderService } from "./organizations-loader.service";

const ctx = testAuthContext();
const organizationId = "507f1f77bcf86cd799439013";

const disabledOrganization = {
  id: organizationId,
  name: "Legacy Org",
  slug: "legacy-org",
  category: "COMPANY",
  i18n: [],
  disabled: true,
  partition: CatalogPartition.GLOBAL,
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

  it("resolves disabled organizations via findManyById for legacy portfolio queries", async () => {
    const req = { user: ctx } as AppRequest;
    const loader = loaderService.createLoader(req);

    await expect(loader.load(organizationId)).resolves.toEqual(
      disabledOrganization
    );
    expect(organizationsService.findManyById).toHaveBeenCalledWith(ctx, [
      organizationId,
    ]);
  });

  it("throws when request is unauthenticated", async () => {
    const req = {} as AppRequest;
    const loader = loaderService.createLoader(req);

    await expect(loader.load(organizationId)).rejects.toThrow(
      UnauthorizedException
    );
    expect(organizationsService.findManyById).not.toHaveBeenCalled();
  });
});
