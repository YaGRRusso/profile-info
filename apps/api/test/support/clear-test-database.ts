import { getConnectionToken } from "@nestjs/mongoose";
import { TestingModule } from "@nestjs/testing";
import { Connection } from "mongoose";

export async function clearTestDatabase(module: TestingModule): Promise<void> {
  const connection = module.get<Connection>(getConnectionToken());
  if (!connection.db) return;
  await connection.db.dropDatabase();
}
