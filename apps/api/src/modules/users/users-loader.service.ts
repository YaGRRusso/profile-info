import { Injectable } from "@nestjs/common";
import DataLoader from "dataloader";
import { keyBy } from "lodash";
import type { UserEntityRecord } from "./entities/user.entity";
import { UsersService } from "./users.service";

@Injectable()
export class UsersLoaderService {
  constructor(private readonly usersService: UsersService) {}

  createLoader() {
    return new DataLoader<string, UserEntityRecord | null>(
      async (ids) => {
        const list = await this.usersService.findManyById([...ids]);
        const map = keyBy(list, (item) => item.id);
        return ids.map((id) => map[id] ?? null);
      },
      { name: "batchUsers", maxBatchSize: 100 }
    );
  }
}
