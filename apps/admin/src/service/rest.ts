import {
  backendHeaders,
  failRequest,
  getApiBaseUrl,
  readErrorMessage,
} from "./backend";

export async function request(
  path: string,
  init?: RequestInit
): Promise<Response> {
  const response = await fetch(new URL(path, getApiBaseUrl()), {
    ...init,
    headers: backendHeaders(init?.headers),
  });

  if (!response.ok) {
    failRequest({
      message: await readErrorMessage(response),
      status: response.status,
    });
  }

  return response;
}
