import type { ExecutionResult } from "graphql";
import { TypedDocumentString } from "@/graphql/graphql";
import { useAuthStore } from "@/stores/auth";

export async function execute<TResult, TVariables>(
  query: TypedDocumentString<TResult, TVariables>,
  ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
) {
  const { token } = useAuthStore.getState();

  if (!import.meta.env.VITE_API_URL) {
    throw new Error("missing VITE_API_URL environment variable");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/graphql-response+json",
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(import.meta.env.VITE_API_URL, {
    headers,
    method: "POST",
    body: JSON.stringify({
      query: query.toString(),
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `failed to fetch: ${response.status} ${response.statusText}`
    );
  }

  return response.json() as ExecutionResult<TResult>;
}
