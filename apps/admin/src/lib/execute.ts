import { TypedDocumentString } from "@/graphql/graphql";
import { useAuthStore } from "@/stores/auth";

export async function execute<Result, Variables>(
  query: TypedDocumentString<Result, Variables>,
  ...[variables]: Variables extends Record<string, never> ? [] : [Variables]
): Promise<Result> {
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

  const { data, errors } = await response.json();

  if (errors?.length) throw new Error(JSON.stringify(errors));
  if (!data) throw new Error("no data returned");

  return data as Result;
}
