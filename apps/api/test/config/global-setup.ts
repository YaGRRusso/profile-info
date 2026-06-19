import { mkdirSync } from "node:fs";
import path from "node:path";
import { MongoMemoryServer } from "mongodb-memory-server";
import { cleanTestCache } from "../support/clean-test-cache";
import { writeTestMongoConfig } from "../support/test-mongo-config";

declare global {
  // eslint-disable-next-line no-var
  var __MONGOD__: MongoMemoryServer | undefined;
}

export default async function globalSetup() {
  cleanTestCache();

  if (process.env.TEST_DATABASE_URL) return;
  if (process.env.USE_MEMORY_MONGO !== "true") return;

  const workspaceCacheDir = path.join(process.cwd(), ".cache/mongodb-binaries");
  const dataDir = path.join(process.cwd(), ".cache/mongodb-data");
  mkdirSync(workspaceCacheDir, { recursive: true });
  mkdirSync(dataDir, { recursive: true });
  process.env.MONGOMS_DOWNLOAD_DIR = workspaceCacheDir;

  const mongod = await MongoMemoryServer.create({
    binary: { version: "7.0.14" },
    instance: { dbName: "profile-test", dbPath: dataDir },
  });

  globalThis.__MONGOD__ = mongod;
  writeTestMongoConfig({ uri: mongod.getUri() });
}
