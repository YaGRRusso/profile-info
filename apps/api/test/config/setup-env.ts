import { applyTestEnv } from "../support/test-env";
import { resolveTestDatabaseUrl } from "../support/test-mongo-config";

applyTestEnv(resolveTestDatabaseUrl());
