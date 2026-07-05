import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { testAuthContext } from "@test/fixtures/auth-context";
import { REFERENCES_NOT_FOUND } from "@/common/helpers/assert.helper";
import { PERSISTENCE_NOT_FOUND } from "@/core/persistence/persistence.messages";
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
        .mockResolvedValue([{ id: organizationId, disabled: false }]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationsValidatorService,
        { provide: OrganizationsService, useValue: organizationsService },
      ],
    }).compile();

    validator = module.get(OrganizationsValidatorService);
  });

  describe("assertOrganizationExists", () => {
    it("delegates to assertOrganizationsExist", async () => {
      await validator.assertOrganizationExists(ctx, organizationId);

      expect(organizationsService.findManyActiveById).toHaveBeenCalledWith(
        ctx,
        [organizationId]
      );
    });
  });

  describe("assertOrganizationsExist", () => {
    it("accepts when every organization exists", async () => {
      await expect(
        validator.assertOrganizationsExist(ctx, [organizationId])
      ).resolves.toBeUndefined();
    });

    it("rejects when any organization is missing", async () => {
      organizationsService.findManyActiveById.mockResolvedValue([]);

      await expect(
        validator.assertOrganizationsExist(ctx, [missingId])
      ).rejects.toThrow(new BadRequestException(REFERENCES_NOT_FOUND));
    });

    it("rejects when any organization is disabled", async () => {
      organizationsService.findManyActiveById.mockRejectedValue(
        new NotFoundException(PERSISTENCE_NOT_FOUND)
      );

      await expect(
        validator.assertOrganizationsExist(ctx, [organizationId])
      ).rejects.toThrow(new NotFoundException(PERSISTENCE_NOT_FOUND));
    });
  });
});
