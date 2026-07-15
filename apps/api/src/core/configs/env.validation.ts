import { z } from "zod";
import { parseCommaSeparatedList } from "@/common/helpers/parse-comma-separated-list.helper";

export const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  GRAPHQL_INTROSPECTION: z
    .enum(["true", "false"])
    .transform((value) => value === "true"),
  HOST: z.string().default("0.0.0.0"),
  JWT_SECRET: z.string().min(1),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  OPENROUTER_AI_MODELS: z
    .string()
    .min(1)
    .transform(parseCommaSeparatedList)
    .refine((models) => models.length > 0, {
      message: "At least one model is required",
    }),
  OPENROUTER_API_KEY: z.string().min(1),
  PORT: z.coerce.number().default(8080),
  TAVILY_API_KEY: z.string().min(1),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    const message = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");

    throw new Error(`Invalid environment variables: ${message}`);
  }

  return result.data;
}
