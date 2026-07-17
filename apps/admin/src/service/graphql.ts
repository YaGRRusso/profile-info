import { TypedDocumentString } from "@/generated/graphql/graphql";
import type { GqlResponse } from "@/lib/gql";
import { backendHeaders, failRequest, getApiBaseUrl } from "./backend";

export async function request<Result, Variables>(
  query: TypedDocumentString<Result, Variables>,
  ...[variables]: Variables extends Record<string, never> ? [] : [Variables]
): Promise<Result> {
  const response = await fetch(new URL("/graphql", getApiBaseUrl()), {
    body: JSON.stringify({
      query: query.toString(),
      variables,
    }),
    headers: backendHeaders({
      Accept: "application/graphql-response+json",
      "Content-Type": "application/json",
    }),
    method: "POST",
  });

  const body: GqlResponse<Result> = await response.json();

  if (body.errors?.length) {
    const [first] = body.errors;
    failRequest(first?.message ?? "an error occurred", {
      code: first?.extensions?.code,
    });
  }

  if (!response.ok) {
    failRequest(`failed to fetch: ${response.status} ${response.statusText}`, {
      status: response.status,
    });
  }

  if (!body.data) {
    failRequest("no data returned", { status: response.status });
  }

  return body.data;
}
