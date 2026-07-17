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
  const baseUrl = getApiBaseUrl();
  const url = new URL(path, baseUrl);
  const headers = backendHeaders(init?.headers);

  const response = await fetch(url, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const message = await readErrorMessage(response);
    failRequest({
      message,
      status: response.status,
    });
  }

  return response;
}
