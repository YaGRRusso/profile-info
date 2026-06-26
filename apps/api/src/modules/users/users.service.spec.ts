import { BadRequestException, NotFoundException } from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { hash } from "bcryptjs";
import mongoose, { Model } from "mongoose";
import { UserRole } from "@/core/enums/user-role.enum";
import { UserModel } from "@/modules/users/schemas/user.schema";
import { UsersRepository } from "./users.repository";
import { UsersService } from "./users.service";

jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("hashed-password"),
}));

const validId = new mongoose.Types.ObjectId().toHexString();

const fakeUser = {
  _id: validId,
  id: validId,
  name: "John",
  nickname: "john",
  email: "john@example.com",
  password: "hashed-password",
  role: UserRole.USER,
  i18n: [],
  urls: [],
} as unknown as UserModel;

function makeExec(returnValue: unknown) {
  return {
    select: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(returnValue),
  };
}

describe("UsersService", () => {
  let service: UsersService;
  let model: jest.Mocked<Model<UserModel>>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        UsersRepository,
        {
          provide: getModelToken(UserModel.name),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            countDocuments: jest.fn(),
            findOneAndUpdate: jest.fn(),
            findOneAndDelete: jest.fn(),
            updateMany: jest.fn(),
            deleteMany: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    model = module.get(getModelToken(UserModel.name));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findOneById", () => {
    it("should return the user without password", async () => {
      (model.findOne as jest.Mock).mockReturnValue(makeExec(fakeUser));

      const result = await service.findOneById(validId);
      expect(result).toEqual(
        expect.objectContaining({ id: validId, email: "john@example.com" })
      );
      expect(result).not.toHaveProperty("password");
      expect(model.findOne).toHaveBeenCalledWith({ _id: validId });
    });

    it("should throw BadRequestException for invalid id", async () => {
      await expect(service.findOneById("invalid")).rejects.toThrow(
        BadRequestException
      );
    });

    it("should throw NotFoundException when user is not found", async () => {
      (model.findOne as jest.Mock).mockReturnValue(makeExec(null));

      await expect(service.findOneById(validId)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe("findOne", () => {
    it("should return the user matching filters", async () => {
      (model.findOne as jest.Mock).mockReturnValue(makeExec(fakeUser));

      const result = await service.findOne({
        filters: { email: "john@example.com" },
      });
      expect(result).toEqual(
        expect.objectContaining({ id: validId, email: "john@example.com" })
      );
    });

    it("should throw NotFoundException when no user matches", async () => {
      (model.findOne as jest.Mock).mockReturnValue(makeExec(null));

      await expect(service.findOne({})).rejects.toThrow(NotFoundException);
    });
  });

  describe("findOneByEmailWithPassword", () => {
    it("should return the user with password selected", async () => {
      (model.findOne as jest.Mock).mockReturnValue(makeExec(fakeUser));

      const result =
        await service.findOneByEmailWithPassword("john@example.com");

      expect(result).toEqual(
        expect.objectContaining({
          id: validId,
          email: "john@example.com",
          password: "hashed-password",
        })
      );
      expect(model.findOne).toHaveBeenCalledWith({ email: "john@example.com" });
    });

    it("should throw NotFoundException when user is not found", async () => {
      (model.findOne as jest.Mock).mockReturnValue(makeExec(null));

      await expect(
        service.findOneByEmailWithPassword("missing@example.com")
      ).rejects.toThrow(NotFoundException);
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

    it("should hash the password before creating the user", async () => {
      (model.create as jest.Mock).mockResolvedValue(fakeUser);

      const result = await service.createOne(createInput);

      expect(hash).toHaveBeenCalledWith("plain-pass", 8);
      expect(model.create).toHaveBeenCalledWith(
        expect.objectContaining({ password: "hashed-password" })
      );
      expect(result).toEqual(
        expect.objectContaining({ id: validId, email: "john@example.com" })
      );
    });

    it("should throw BadRequestException when create returns null", async () => {
      (model.create as jest.Mock).mockResolvedValue(null);

      await expect(service.createOne(createInput)).rejects.toThrow(
        BadRequestException
      );
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

    it("should hash each password before creating users", async () => {
      (model.create as jest.Mock).mockResolvedValue([fakeUser]);

      const result = await service.createMany(createInputs);

      expect(hash).toHaveBeenCalledTimes(2);
      expect(model.create).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ password: "hashed-password" }),
        ])
      );
      expect(result).toEqual({ succeeded: 1, failed: 1 });
    });

    it("should throw BadRequestException when create returns null", async () => {
      (model.create as jest.Mock).mockResolvedValue(null);

      await expect(service.createMany(createInputs)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe("updateOne", () => {
    it("should hash the password when updating a user", async () => {
      (model.findOneAndUpdate as jest.Mock).mockReturnValue(makeExec(fakeUser));

      await service.updateOne("507f1f77bcf86cd799439011", {
        password: "new-pass",
      });

      expect(hash).toHaveBeenCalledWith("new-pass", 8);
      expect(model.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: "507f1f77bcf86cd799439011" },
        expect.objectContaining({ password: "hashed-password" }),
        { returnDocument: "after", runValidators: true }
      );
    });
  });
});
