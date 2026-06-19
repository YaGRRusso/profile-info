import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const defaultLocalUri = "mongodb://127.0.0.1:27017/profile-test-e2e";
const cacheDir = path.join(process.cwd(), ".cache");
const configPath = path.join(cacheDir, "test-mongo.json");

interface TestMongoConfig {
  uri: string;
}

export function writeTestMongoConfig(config: TestMongoConfig): void {
  mkdirSync(cacheDir, { recursive: true });
  writeFileSync(configPath, JSON.stringify(config));
}

export function resolveTestDatabaseUrl(): string {
  if (process.env.TEST_DATABASE_URL) {
    return process.env.TEST_DATABASE_URL;
  }

  if (process.env.USE_MEMORY_MONGO === "true" && existsSync(configPath)) {
    const config = JSON.parse(
      readFileSync(configPath, "utf-8")
    ) as TestMongoConfig;
    return config.uri;
  }

  return defaultLocalUri;
}
