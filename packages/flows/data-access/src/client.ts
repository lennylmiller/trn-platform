const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const url = `${BASE_URL}/api/v2/flows${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(
      (body as { message?: string }).message || `Request failed: ${res.status}`,
    );
  }

  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}
