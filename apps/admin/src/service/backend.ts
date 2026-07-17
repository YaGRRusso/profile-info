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
  const locale = resolveActiveLocale();

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  headers.set("Accept-Language", locale);

  return headers;
}

export interface RequestFailure {
  code?: string;
  message: string;
  status?: number;
}

export function failRequest(failure: RequestFailure): never {
  const auth = useAuthStore.getState();

  if (isUnauthenticated(failure) && auth.token) {
    auth.clearAuth();
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
  const fallback = response.statusText || `failed to fetch: ${response.status}`;

  try {
    const body = await response.json();
    const message = messageFromUnknown(body);
    return message ?? fallback;
  } catch {
    return fallback;
  }
}
