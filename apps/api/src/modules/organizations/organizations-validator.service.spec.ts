import { BadRequestException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { REFERENCES_NOT_FOUND } from "@/common/helpers/assert.helper";
import { OrganizationsService } from "./organizations.service";
import { OrganizationsValidatorService } from "./organizations-validator.service";

const organizationId = "507f1f77bcf86cd799439011";
const missingId = "507f1f77bcf86cd799439099";

describe("OrganizationsValidatorService", () => {
  let validator: OrganizationsValidatorService;
  let organizationsService: { findManyById: jest.Mock };

  beforeEach(async () => {
    organizationsService = {
      findManyById: jest.fn().mockResolvedValue([{ id: organizationId }]),
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
      await validator.assertOrganizationExists(organizationId);

      expect(organizationsService.findManyById).toHaveBeenCalledWith([
        organizationId,
      ]);
    });
  });

  describe("assertOrganizationsExist", () => {
    it("accepts when every organization exists", async () => {
      await expect(
        validator.assertOrganizationsExist([organizationId])
      ).resolves.toBeUndefined();
    });

    it("rejects when any organization is missing", async () => {
      organizationsService.findManyById.mockResolvedValue([]);

      await expect(
        validator.assertOrganizationsExist([missingId])
      ).rejects.toThrow(new BadRequestException(REFERENCES_NOT_FOUND));
    });
  });
});
