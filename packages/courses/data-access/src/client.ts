const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export class ApiError extends Error {
  constructor(message: string, public status: number, public body?: unknown) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  if (res.status === 204) return undefined as T;
  if (!res.ok) {
    let body: unknown;
    try { body = await res.json(); } catch { body = await res.text(); }
    const message = body && typeof body === 'object' && 'message' in body
      ? (body as { message: string }).message
      : `Request failed: ${res.status} ${res.statusText}`;
    throw new ApiError(message, res.status, body);
  }
  return res.json() as Promise<T>;
}
