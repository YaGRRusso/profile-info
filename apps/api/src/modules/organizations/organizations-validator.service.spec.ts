import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { testAuthContext } from "@test/fixtures/auth-context";
import { i18nKey } from "@/core/i18n/i18n";
import { OrganizationsService } from "./organizations.service";
import { OrganizationsValidatorService } from "./organizations-validator.service";

const ctx = testAuthContext();
const organizationId = "507f1f77bcf86cd799439011";
const missingId = "507f1f77bcf86cd799439099";

describe("OrganizationsValidatorService", () => {
  let validator: OrganizationsValidatorService;
  let organizationsService: { findManyActiveById: jest.Mock };

  beforeEach(async () => {
    organizationsService = {
      findManyActiveById: jest
        .fn()
        .mockResolvedValue([{ disabled: false, id: organizationId }]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationsValidatorService,
        { provide: OrganizationsService, useValue: organizationsService },
      ],
    }).compile();

    validator = module.get(OrganizationsValidatorService);
  });

  describe("assertOrganizationEnabled", () => {
    it("delegates to assertOrganizationsEnabled", async () => {
      await validator.assertOrganizationEnabled(ctx, organizationId);

      expect(organizationsService.findManyActiveById).toHaveBeenCalledWith(
        ctx,
        [organizationId]
      );
    });
  });

  describe("assertOrganizationsEnabled", () => {
    it("accepts when every organization is enabled", async () => {
      await expect(
        validator.assertOrganizationsEnabled(ctx, [organizationId])
      ).resolves.toBeUndefined();
    });

    it("rejects when any organization is missing", async () => {
      organizationsService.findManyActiveById.mockResolvedValue([]);

      await expect(
        validator.assertOrganizationsEnabled(ctx, [missingId])
      ).rejects.toThrow(
        new BadRequestException(i18nKey("common.REFERENCES_NOT_FOUND"))
      );
    });

    it("rejects when any organization is disabled", async () => {
      organizationsService.findManyActiveById.mockRejectedValue(
        new NotFoundException(i18nKey("persistence.NOT_FOUND"))
      );

      await expect(
        validator.assertOrganizationsEnabled(ctx, [organizationId])
      ).rejects.toThrow(
        new NotFoundException(i18nKey("persistence.NOT_FOUND"))
      );
    });
  });
});
