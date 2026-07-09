export function applyTestEnv(databaseUrl: string) {
  process.env.DATABASE_URL = databaseUrl;
  process.env.JWT_SECRET = "test-jwt-secret";
  process.env.OPENROUTER_API_KEY = "test-openrouter-key";
  process.env.OPENROUTER_AI_MODELS = "test/model-a,test/model-b";
  process.env.GITHUB_API_KEY = "test-github-key";
  process.env.TAVILY_API_KEY = "test-tavily-key";
  process.env.GRAPHQL_INTROSPECTION = "false";
  process.env.NODE_ENV = "test";
}
