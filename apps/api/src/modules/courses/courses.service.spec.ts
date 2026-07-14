import { BadRequestException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { testAuthContext } from "@test/fixtures/auth-context";
import { REFERENCES_NOT_FOUND } from "@/common/helpers/assert.helper";
import {
  createMockCrud,
  createMockStats,
} from "@/core/persistence/repositories/testing/service-spec.mock";
import { CourseStatus } from "@/modules/courses/enums/status.enum";
import { OrganizationsValidatorService } from "@/modules/organizations/organizations-validator.service";
import { SkillsValidatorService } from "@/modules/skills/skills-validator.service";
import { CoursesRepository } from "./courses.repository";
import { CoursesService } from "./courses.service";

const ownerId = "507f1f77bcf86cd799439011";
const organizationId = "507f1f77bcf86cd799439012";
const validId = "507f1f77bcf86cd799439013";
const ctx = testAuthContext({ id: ownerId });

const fakeEntity = {
  id: validId,
  ownerId,
  slug: "bootcamp",
};

describe("CoursesService", () => {
  let service: CoursesService;
  let crud: ReturnType<typeof createMockCrud>;
  let organizationsValidator: {
    assertOrganizationEnabled: jest.Mock;
    assertOrganizationsEnabled: jest.Mock;
  };
  let skillsValidator: { assertSkillsEnabled: jest.Mock };
  let stats: ReturnType<typeof createMockStats>;
  let repository: {
    tenantCrud: jest.Mock;
    tenantStats: jest.Mock;
    detachSkill: jest.Mock;
    purgeByOrganization: jest.Mock;
    purgeByOwner: jest.Mock;
    countByOwners: jest.Mock;
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    crud = createMockCrud();
    stats = createMockStats();
    repository = {
      countByOwners: jest.fn(),
      detachSkill: jest.fn(),
      purgeByOrganization: jest.fn(),
      purgeByOwner: jest.fn(),
      tenantCrud: jest.fn().mockReturnValue(crud),
      tenantStats: jest.fn().mockReturnValue(stats),
    };
    organizationsValidator = {
      assertOrganizationEnabled: jest.fn().mockResolvedValue(undefined),
      assertOrganizationsEnabled: jest.fn().mockResolvedValue(undefined),
    };
    skillsValidator = {
      assertSkillsEnabled: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        { provide: CoursesRepository, useValue: repository },
        {
          provide: OrganizationsValidatorService,
          useValue: organizationsValidator,
        },
        { provide: SkillsValidatorService, useValue: skillsValidator },
      ],
    }).compile();

    service = module.get(CoursesService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findOneById", () => {
    it("delegates to scoped crud", async () => {
      crud.findOneById.mockResolvedValue(fakeEntity);

      await expect(service.findOneById(ctx, validId)).resolves.toEqual(
        fakeEntity
      );
      expect(repository.tenantCrud).toHaveBeenCalledWith(ctx);
      expect(crud.findOneById).toHaveBeenCalledWith(validId);
    });
  });

  describe("createOne", () => {
    const createInput = {
      i18n: [
        {
          locale: "en",
          messages: {
            description: "Intensive course",
            title: "Bootcamp",
          },
        },
      ],
      organizationId,
      slug: "bootcamp",
      status: CourseStatus.COMPLETE,
    };

    it("delegates to scoped crud", async () => {
      crud.createOne.mockResolvedValue(fakeEntity);

      await expect(service.createOne(ctx, createInput)).resolves.toEqual(
        fakeEntity
      );
      expect(
        organizationsValidator.assertOrganizationEnabled
      ).toHaveBeenCalledWith(ctx, organizationId);
      expect(repository.tenantCrud).toHaveBeenCalledWith(ctx);
      expect(crud.createOne).toHaveBeenCalledWith(createInput);
    });

    it("rejects missing organization reference", async () => {
      organizationsValidator.assertOrganizationEnabled.mockRejectedValue(
        new BadRequestException(REFERENCES_NOT_FOUND)
      );

      await expect(service.createOne(ctx, createInput)).rejects.toThrow(
        new BadRequestException(REFERENCES_NOT_FOUND)
      );
      expect(crud.createOne).not.toHaveBeenCalled();
    });
  });

  describe("updateOne", () => {
    it("delegates to scoped crud", async () => {
      crud.updateOneById.mockResolvedValue(fakeEntity);

      await expect(service.updateOne(ctx, validId, {})).resolves.toEqual(
        fakeEntity
      );
      expect(repository.tenantCrud).toHaveBeenCalledWith(ctx);
      expect(crud.updateOneById).toHaveBeenCalledWith(validId, {});
    });
  });

  describe("removeOne", () => {
    it("delegates to scoped crud", async () => {
      crud.deleteOneById.mockResolvedValue(fakeEntity);

      await expect(service.removeOne(ctx, validId)).resolves.toEqual(
        fakeEntity
      );
      expect(repository.tenantCrud).toHaveBeenCalledWith(ctx);
      expect(crud.deleteOneById).toHaveBeenCalledWith(validId);
    });
  });

  describe("removeMany", () => {
    it("delegates to scoped crud", async () => {
      crud.deleteManyById.mockResolvedValue({ failed: 0, succeeded: 1 });

      await expect(service.removeMany(ctx, [validId])).resolves.toEqual({
        failed: 0,
        succeeded: 1,
      });
      expect(repository.tenantCrud).toHaveBeenCalledWith(ctx);
      expect(crud.deleteManyById).toHaveBeenCalledWith([validId]);
    });
  });

  describe("detachSkill", () => {
    it("delegates to repository helper", async () => {
      await service.detachSkill(validId);
      expect(repository.detachSkill).toHaveBeenCalledWith(validId);
    });
  });

  describe("purgeByOrganization", () => {
    it("delegates to repository helper", async () => {
      await service.purgeByOrganization(organizationId);
      expect(repository.purgeByOrganization).toHaveBeenCalledWith(
        organizationId
      );
    });
  });

  describe("purgeByOwner", () => {
    it("delegates to repository helper", async () => {
      await service.purgeByOwner(ownerId);
      expect(repository.purgeByOwner).toHaveBeenCalledWith(ownerId);
    });
  });
});
