/**
 * Server-side fetch wrapper for the Express API.
 * Used by chat tools that proxy course CRUD through the Express API.
 * Same pattern as packages/mcp-server/src/util/api-client.ts.
 */

const BASE_URL = process.env.API_URL ?? 'http://localhost:3001';

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${BASE_URL}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (res.status === 204) {
    return undefined as T;
  }

  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = await res.text();
    }

    const message =
      body && typeof body === 'object' && 'message' in body
        ? (body as { message: string }).message
        : `Request failed: ${res.status} ${res.statusText}`;

    throw new Error(message);
  }

  return res.json() as Promise<T>;
}
