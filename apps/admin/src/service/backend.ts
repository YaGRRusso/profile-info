import { resolveActiveLocale } from "@/lib/i18n";
import { useAuthStore } from "@/stores/auth";

export function getApiBaseUrl(): string {
  const apiUrl = import.meta.env.VITE_API_URL;

  if (!apiUrl) {
    throw new Error("missing VITE_API_URL environment variable");
  }

  return apiUrl;
}

export function backendHeaders(init?: HeadersInit): Headers {
  const headers = new Headers(init);
  const { token } = useAuthStore.getState();

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (!headers.has("Accept-Language")) {
    headers.set("Accept-Language", resolveActiveLocale());
  }

  return headers;
}

export interface RequestFailure {
  code?: string;
  message: string;
  status?: number;
}

export function failRequest(failure: RequestFailure): never {
  if (isUnauthenticated(failure) && useAuthStore.getState().token) {
    useAuthStore.getState().clearAuth();
  }

  throw new Error(failure.message);
}

function isUnauthenticated(failure: RequestFailure): boolean {
  return failure.code === "UNAUTHENTICATED" || failure.status === 401;
}

function messageFromUnknown(body: unknown): string | undefined {
  if (!body || typeof body !== "object" || !("message" in body)) return;

  const { message } = body;
  if (typeof message === "string") return message;
  if (Array.isArray(message) && typeof message[0] === "string") {
    return message[0];
  }
}

export async function readErrorMessage(response: Response): Promise<string> {
  try {
    const json = await response.json();
    const message = messageFromUnknown(json);
    if (message) return message;
  } catch {
    /* non-JSON body */
  }

  return response.statusText || `failed to fetch: ${response.status}`;
}
