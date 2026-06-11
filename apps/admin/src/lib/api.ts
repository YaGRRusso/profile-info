import { useAuthStore } from "@/stores/auth";

export function getApiOrigin(): string {
  const apiUrl = import.meta.env.VITE_API_URL;

  if (!apiUrl) {
    throw new Error("missing VITE_API_URL environment variable");
  }

  // biome-ignore lint/performance/useTopLevelRegex: workaround
  return apiUrl.replace(/\/graphql\/?$/, "");
}

export async function apiRequest(
  path: string,
  init?: RequestInit
): Promise<Response> {
  const { token } = useAuthStore.getState();
  const headers = new Headers(init?.headers);

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(new URL(path, getApiOrigin()), {
    ...init,
    headers,
  });

  if (!response.ok) {
    throw new Error(
      `failed to fetch: ${response.status} ${response.statusText}`
    );
  }

  return response;
}
