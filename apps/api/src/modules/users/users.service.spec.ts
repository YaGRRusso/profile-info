import { Test, TestingModule } from "@nestjs/testing";
import { hash } from "bcryptjs";
import { UserRole } from "@/core/enums/user-role.enum";
import { createMockCrud } from "@/core/persistence/repositories/testing/service-spec.mock";
import { UsersRepository } from "./users.repository";
import { UsersService } from "./users.service";

jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("hashed-password"),
}));

const validId = "507f1f77bcf86cd799439013";

const fakeUser = {
  id: validId,
  name: "John",
  nickname: "john",
  email: "john@example.com",
  role: UserRole.USER,
  i18n: [],
  urls: [],
};

const fakeUserWithPassword = {
  ...fakeUser,
  password: "hashed-password",
};

describe("UsersService", () => {
  let service: UsersService;
  let crud: ReturnType<typeof createMockCrud>;
  let repository: {
    crud: ReturnType<typeof createMockCrud>;
    findOneByEmailWithPassword: jest.Mock;
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    crud = createMockCrud();
    repository = {
      crud,
      findOneByEmailWithPassword: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: repository },
      ],
    }).compile();

    service = module.get(UsersService);
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

  describe("createOne", () => {
    const createInput = {
      name: "John",
      nickname: "john",
      email: "john@example.com",
      password: "plain-pass",
      role: UserRole.USER,
    };

    it("hashes the password before delegating to crud", async () => {
      crud.createOne.mockResolvedValue(fakeUser);

      await expect(service.createOne(createInput)).resolves.toEqual(fakeUser);

      expect(hash).toHaveBeenCalledWith("plain-pass", 8);
      expect(crud.createOne).toHaveBeenCalledWith({
        name: "John",
        nickname: "john",
        email: "john@example.com",
        role: UserRole.USER,
        password: "hashed-password",
      });
    });
  });

  describe("createMany", () => {
    const createInputs = [
      {
        name: "Alice",
        nickname: "alice",
        email: "alice@example.com",
        password: "pass1",
        role: UserRole.USER,
      },
      {
        name: "Bob",
        nickname: "bob",
        email: "bob@example.com",
        password: "pass2",
        role: UserRole.USER,
      },
    ];

    it("hashes each password before delegating to crud", async () => {
      crud.createMany.mockResolvedValue({ succeeded: 2, failed: 0 });

      await expect(service.createMany(createInputs)).resolves.toEqual({
        succeeded: 2,
        failed: 0,
      });

      expect(hash).toHaveBeenCalledTimes(2);
      expect(crud.createMany).toHaveBeenCalledWith([
        {
          name: "Alice",
          nickname: "alice",
          email: "alice@example.com",
          role: UserRole.USER,
          password: "hashed-password",
        },
        {
          name: "Bob",
          nickname: "bob",
          email: "bob@example.com",
          role: UserRole.USER,
          password: "hashed-password",
        },
      ]);
    });
  });

  describe("updateOne", () => {
    it("hashes the password when provided", async () => {
      crud.updateOneById.mockResolvedValue(fakeUser);

      await service.updateOne(validId, { password: "new-pass" });

      expect(hash).toHaveBeenCalledWith("new-pass", 8);
      expect(crud.updateOneById).toHaveBeenCalledWith(validId, {
        password: "hashed-password",
      });
    });

    it("skips hashing when password is omitted", async () => {
      crud.updateOneById.mockResolvedValue(fakeUser);

      await service.updateOne(validId, { name: "Jane" });

      expect(hash).not.toHaveBeenCalled();
      expect(crud.updateOneById).toHaveBeenCalledWith(validId, {
        name: "Jane",
      });
    });
  });
});
