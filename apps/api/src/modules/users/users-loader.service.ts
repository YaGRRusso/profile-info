import { Injectable } from "@nestjs/common";
import DataLoader from "dataloader";
import { keyBy } from "lodash";
import { UserModel } from "@/modules/users/schemas/user.schema";
import { UsersService } from "./users.service";

@Injectable()
export class UsersLoaderService {
  constructor(private readonly usersService: UsersService) {}

  createLoader() {
    return new DataLoader<string, UserModel | null>(
      async (ids) => {
        const list = await this.usersService.findManyById([...ids]);
        const map = keyBy(list, (item) => item.id.toString());
        return ids.map((id) => map[id] ?? null);
      },
      { name: "batchUsers", maxBatchSize: 100 }
    );
  }
}
