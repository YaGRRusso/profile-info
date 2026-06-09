import { applyTestEnv } from "../support/test-env";

applyTestEnv(
  process.env.TEST_DATABASE_URL ?? "mongodb://127.0.0.1:27017/profile-test-e2e"
);
