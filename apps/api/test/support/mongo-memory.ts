import { mkdirSync } from "node:fs";
import path from "node:path";
import { MongoMemoryServer } from "mongodb-memory-server";

const workspaceCacheDir = path.join(process.cwd(), ".cache/mongodb-binaries");
const defaultLocalUri = "mongodb://127.0.0.1:27017/profile-test-e2e";

let sharedMongod: MongoMemoryServer | undefined;
let sharedUri: string | undefined;

export function startTestMongo(): Promise<{
  uri: string;
  mongod?: MongoMemoryServer;
}> {
  if (process.env.TEST_DATABASE_URL) {
    return Promise.resolve({ uri: process.env.TEST_DATABASE_URL });
  }

  if (process.env.USE_MEMORY_MONGO === "true") {
    return startMemoryMongo();
  }

  return Promise.resolve({ uri: defaultLocalUri });
}

async function startMemoryMongo(): Promise<{
  uri: string;
  mongod: MongoMemoryServer;
}> {
  if (sharedUri && sharedMongod) {
    return { uri: sharedUri, mongod: sharedMongod };
  }

  mkdirSync(workspaceCacheDir, { recursive: true });
  process.env.MONGOMS_DOWNLOAD_DIR = workspaceCacheDir;

  sharedMongod = await MongoMemoryServer.create({
    binary: { version: "7.0.14" },
    instance: { dbName: "profile-test" },
  });
  sharedUri = sharedMongod.getUri();

  return { uri: sharedUri, mongod: sharedMongod };
}

export async function stopTestMongo(): Promise<void> {
  await sharedMongod?.stop();
  sharedMongod = undefined;
  sharedUri = undefined;
}
