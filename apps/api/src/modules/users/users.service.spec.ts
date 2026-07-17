import { ForbiddenException } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Test, TestingModule } from "@nestjs/testing";
import { testSuperAdminContext } from "@test/fixtures/auth-context";
import { hash } from "bcryptjs";
import { UserRole } from "@/core/enums/user-role.enum";
import { DomainEvents } from "@/core/events/domain-events";
import { UserDeletedEvent } from "@/core/events/user-deleted.event";
import { createMockCrud } from "@/core/persistence/repositories/testing/service-spec.mock";
import { SkillsValidatorService } from "@/modules/skills/skills-validator.service";
import { UsersRepository } from "./users.repository";
import { UsersService } from "./users.service";

jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("hashed-password"),
}));

const ctx = testSuperAdminContext();
const validId = "507f1f77bcf86cd799439013";

const fakeUser = {
  disabled: false,
  email: "john@example.com",
  i18n: [],
  id: validId,
  name: "John",
  nickname: "john",
  role: UserRole.USER,
  urls: [],
};

const fakeUserWithPassword = {
  ...fakeUser,
  password: "hashed-password",
};

describe("UsersService", () => {
  let service: UsersService;
  let crud: ReturnType<typeof createMockCrud>;
  let eventEmitter: jest.Mocked<Pick<EventEmitter2, "emitAsync">>;
  let skillsValidator: jest.Mocked<
    Pick<SkillsValidatorService, "assertSkillsEnabled">
  >;
  let repository: {
    crud: ReturnType<typeof createMockCrud>;
    findOneByEmailWithPassword: jest.Mock;
    detachSkill: jest.Mock;
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    crud = createMockCrud();
    repository = {
      crud,
      detachSkill: jest.fn().mockResolvedValue(undefined),
      findOneByEmailWithPassword: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: repository },
        {
          provide: EventEmitter2,
          useValue: { emitAsync: jest.fn().mockResolvedValue([]) },
        },
        {
          provide: SkillsValidatorService,
          useValue: {
            assertSkillsEnabled: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get(UsersService);
    eventEmitter = module.get(EventEmitter2);
    skillsValidator = module.get(SkillsValidatorService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findOneById", () => {
    it("delegates to crud", async () => {
      crud.findOneById.mockResolvedValue(fakeUser);

      await expect(service.findOneById(validId)).resolves.toEqual(fakeUser);
      expect(crud.findOneById).toHaveBeenCalledWith(validId);
    });
  });

  describe("findOne", () => {
    it("delegates to crud", async () => {
      crud.findOne.mockResolvedValue(fakeUser);

      await expect(
        service.findOne({ filters: { email: "john@example.com" } })
      ).resolves.toEqual(fakeUser);
      expect(crud.findOne).toHaveBeenCalledWith({
        filters: { email: "john@example.com" },
      });
    });
  });

  describe("findOneByEmailWithPassword", () => {
    it("delegates to repository", async () => {
      repository.findOneByEmailWithPassword.mockResolvedValue(
        fakeUserWithPassword
      );

      await expect(
        service.findOneByEmailWithPassword("john@example.com")
      ).resolves.toEqual(fakeUserWithPassword);
      expect(repository.findOneByEmailWithPassword).toHaveBeenCalledWith(
        "john@example.com"
      );
    });
  });

  describe("register", () => {
    const registerInput = {
      email: "jane@example.com",
      name: "Jane",
      nickname: "jane",
      password: "plain-pass",
    };

    it("creates a disabled USER account", async () => {
      crud.createOne.mockResolvedValue({ ...fakeUser, ...registerInput });

      await expect(service.register(registerInput)).resolves.toEqual({
        ...fakeUser,
        ...registerInput,
      });

      expect(crud.createOne).toHaveBeenCalledWith({
        ...registerInput,
        disabled: true,
        password: "hashed-password",
        role: UserRole.USER,
      });
    });
  });

  describe("createOne", () => {
    const createInput = {
      email: "john@example.com",
      name: "John",
      nickname: "john",
      password: "plain-pass",
      role: UserRole.USER,
    };

    it("hashes the password before delegating to crud", async () => {
      crud.createOne.mockResolvedValue(fakeUser);

      await expect(service.createOne(ctx, createInput)).resolves.toEqual(
        fakeUser
      );

      expect(hash).toHaveBeenCalledWith("plain-pass", 8);
      expect(crud.createOne).toHaveBeenCalledWith({
        disabled: false,
        email: "john@example.com",
        name: "John",
        nickname: "john",
        password: "hashed-password",
        role: UserRole.USER,
      });
      expect(skillsValidator.assertSkillsEnabled).not.toHaveBeenCalled();
    });

    it("validates skillIds when provided", async () => {
      const skillId = "507f1f77bcf86cd799439014";
      crud.createOne.mockResolvedValue(fakeUser);

      await service.createOne(ctx, { ...createInput, skillIds: [skillId] });

      expect(skillsValidator.assertSkillsEnabled).toHaveBeenCalledWith(ctx, [
        skillId,
      ]);
      expect(crud.createOne).toHaveBeenCalledWith({
        disabled: false,
        email: "john@example.com",
        name: "John",
        nickname: "john",
        password: "hashed-password",
        role: UserRole.USER,
        skillIds: [skillId],
      });
    });
  });

  describe("createMany", () => {
    const createInputs = [
      {
        email: "alice@example.com",
        name: "Alice",
        nickname: "alice",
        password: "pass1",
        role: UserRole.USER,
      },
      {
        email: "bob@example.com",
        name: "Bob",
        nickname: "bob",
        password: "pass2",
        role: UserRole.USER,
      },
    ];

    it("hashes each password before delegating to crud", async () => {
      crud.createMany.mockResolvedValue({ failed: 0, succeeded: 2 });

      await expect(service.createMany(ctx, createInputs)).resolves.toEqual({
        failed: 0,
        succeeded: 2,
      });

      expect(hash).toHaveBeenCalledTimes(2);
      expect(crud.createMany).toHaveBeenCalledWith([
        {
          disabled: false,
          email: "alice@example.com",
          name: "Alice",
          nickname: "alice",
          password: "hashed-password",
          role: UserRole.USER,
        },
        {
          disabled: false,
          email: "bob@example.com",
          name: "Bob",
          nickname: "bob",
          password: "hashed-password",
          role: UserRole.USER,
        },
      ]);
    });
  });

  describe("updateOne", () => {
    it("hashes the password when provided", async () => {
      crud.updateOneById.mockResolvedValue(fakeUser);

      await service.updateOne(ctx, validId, { password: "new-pass" });

      expect(hash).toHaveBeenCalledWith("new-pass", 8);
      expect(crud.updateOneById).toHaveBeenCalledWith(validId, {
        password: "hashed-password",
      });
    });

    it("skips hashing when password is omitted", async () => {
      crud.updateOneById.mockResolvedValue(fakeUser);

      await service.updateOne(ctx, validId, { name: "Jane" });

      expect(hash).not.toHaveBeenCalled();
      expect(crud.updateOneById).toHaveBeenCalledWith(validId, {
        name: "Jane",
      });
    });
  });

  describe("removeOne", () => {
    it("emits user.deleted before deleting", async () => {
      crud.findOneById.mockResolvedValue(fakeUser);
      crud.deleteOneById.mockResolvedValue(fakeUser);

      await expect(service.removeOne(validId)).resolves.toEqual(fakeUser);

      expect(eventEmitter.emitAsync).toHaveBeenCalledWith(
        DomainEvents.user.deleted,
        new UserDeletedEvent(validId)
      );
      expect(crud.deleteOneById).toHaveBeenCalledWith(validId);
    });

    it("rejects SUPER_ADMIN deletion", async () => {
      crud.findOneById.mockResolvedValue({
        ...fakeUser,
        role: UserRole.SUPER_ADMIN,
      });

      await expect(service.removeOne(validId)).rejects.toThrow(
        ForbiddenException
      );
      expect(eventEmitter.emitAsync).not.toHaveBeenCalled();
      expect(crud.deleteOneById).not.toHaveBeenCalled();
    });
  });

  describe("removeMany", () => {
    it("emits user.deleted for each user before deleteManyById", async () => {
      crud.findManyById.mockResolvedValue([fakeUser]);
      crud.deleteManyById.mockResolvedValue({ failed: 0, succeeded: 1 });

      await expect(service.removeMany([validId])).resolves.toEqual({
        failed: 0,
        succeeded: 1,
      });

      expect(eventEmitter.emitAsync).toHaveBeenCalledWith(
        DomainEvents.user.deleted,
        new UserDeletedEvent(validId)
      );
      expect(crud.deleteManyById).toHaveBeenCalledWith([validId]);
    });

    it("rejects batch when any user is SUPER_ADMIN", async () => {
      crud.findManyById.mockResolvedValue([
        fakeUser,
        {
          ...fakeUser,
          id: "507f1f77bcf86cd799439014",
          role: UserRole.SUPER_ADMIN,
        },
      ]);

      await expect(
        service.removeMany([validId, "507f1f77bcf86cd799439014"])
      ).rejects.toThrow(ForbiddenException);
      expect(eventEmitter.emitAsync).not.toHaveBeenCalled();
      expect(crud.deleteManyById).not.toHaveBeenCalled();
    });
  });

  describe("detachSkill", () => {
    it("delegates to repository helper", async () => {
      await service.detachSkill(validId);
      expect(repository.detachSkill).toHaveBeenCalledWith(validId);
    });
  });
});
