import { TypedDocumentString } from "@/generated/graphql/graphql";
import { useAuthStore } from "@/stores/auth";
import { GqlClientError, type GqlResponse } from "./gql";
import { tc } from "./tc";

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

  const hadToken = Boolean(token);
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await tc(
    fetch(import.meta.env.VITE_API_URL, {
      headers,
      method: "POST",
      body: JSON.stringify({
        query: query.toString(),
        variables,
      }),
    })
  );

  if (!response) throw new Error("no response returned");

  const { data, errors }: GqlResponse<Result> = await response.json();

  if (errors?.length) {
    const isUnauthorized = errors.some(
      (e) => e.extensions?.code === "UNAUTHENTICATED"
    );
    if (isUnauthorized && hadToken) useAuthStore.getState().clearAuth();
    throw new GqlClientError(
      errors[0].message ?? "an error occurred",
      errors[0].extensions?.code
    );
  }

  if (!response.ok) {
    throw new Error(
      `failed to fetch: ${response.status} ${response.statusText}`
    );
  }

  if (!data) throw new Error("no data returned");

  return data;
}
