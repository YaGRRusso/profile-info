import type { ExecutionResult } from "graphql";
import { TypedDocumentString } from "@/graphql/graphql";
import { useAuthStore } from "@/stores/auth";

export async function execute<TResult, TVariables>(
  query: TypedDocumentString<TResult, TVariables>,
  ...[variables]: TVariables extends Record<string, unknown> ? [] : [TVariables]
) {
  // biome-ignore lint/correctness/useHookAtTopLevel: dont fuck
  const { token } = useAuthStore();

  if (!import.meta.env.VITE_API_URL) {
    throw new Error("missing VITE_API_URL environment variable");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/graphql-response+json",
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const controller = new AbortController();
  const response = await fetch(import.meta.env.VITE_API_URL, {
    headers,
    method: "POST",
    signal: controller.signal,
    body: JSON.stringify({
      query: query.toString(),
      variables,
    }),
  }).finally(() => controller.abort());

  if (!response.ok) {
    throw new Error(
      `failed to fetch: ${response.status} ${response.statusText}`
    );
  }

  return response.json() as ExecutionResult<TResult>;
}
