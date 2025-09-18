import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { UserModel } from "@/schemas/user.schema";
import { UsersService } from "./users.service";

const UserModelMock = {};

describe("UsersService", () => {
  let service: UsersService;
  // let model: jest.Mocked<Model<UserModel>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(UserModel.name),
          useValue: UserModelMock,
        },
      ],
    }).compile();

    service = module.get(UsersService);
    // model = module.get(getModelToken(UserModel.name));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
