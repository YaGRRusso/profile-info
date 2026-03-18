import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { hash } from "bcryptjs";
import { isNil } from "lodash";
import { Model, QueryFilter } from "mongoose";
import { clearObject } from "@/core/helpers/object.helper";
import { BaseService } from "@/core/services/base.service";
import { UserModel } from "@/schemas/user.schema";
import { CreateUserInput } from "./dto/create-user.input";
import { UpdateUserInput } from "./dto/update-user.input";

@Injectable()
export class UsersService extends BaseService<
  UserModel,
  CreateUserInput,
  UpdateUserInput
> {
  constructor(
    @InjectModel(UserModel.name)
    readonly userModel: Model<UserModel>
  ) {
    super(userModel);
  }

  async findOneById(id: string): Promise<UserModel> {
    const res = await this.userModel.findById(id).select("+password").exec();

    if (isNil(res)) throw new NotFoundException("Not Found");
    return res;
  }

  async findOne({
    filters,
  }: {
    filters?: QueryFilter<UserModel>;
  }): Promise<UserModel> {
    const res = await this.userModel
      .findOne(clearObject(filters))
      .select("+password")
      .exec();

    if (isNil(res)) throw new NotFoundException("Not Found");
    return res;
  }

  async createOne({
    password,
    ...createUserInput
  }: CreateUserInput): Promise<UserModel> {
    const input = {
      ...createUserInput,
      password: await hash(password, 8),
    };

    const res = await this.userModel.create(input);

    if (isNil(res)) throw new BadRequestException("Not Created");
    return res;
  }

  async createMany(createUserInputs: CreateUserInput[]): Promise<UserModel[]> {
    const inputs = await Promise.all(
      createUserInputs.map(async ({ password, ...createUserInput }) => ({
        ...createUserInput,
        password: await hash(password, 8),
      }))
    );

    const res = await this.userModel.create(inputs);

    if (isNil(res)) throw new BadRequestException("Not Created");
    return res;
  }
}
