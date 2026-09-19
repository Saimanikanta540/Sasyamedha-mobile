import { getAuthToken } from '@/lib/auth/token-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? '';

/** Thrown when no backend is configured — callers fall back to mock data. */
export class NoBackendConfiguredError extends Error {
  constructor() {
    super('EXPO_PUBLIC_API_BASE_URL is not set');
    this.name = 'NoBackendConfiguredError';
  }
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  isMultipart?: boolean;
  auth?: boolean; // defaults to true; login sets this to false
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!BASE_URL) {
    throw new NoBackendConfiguredError();
  }

  const { method = 'GET', body, isMultipart = false, auth = true } = options;
  const headers: Record<string, string> = {};

  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = await getAuthToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: isMultipart ? (body as FormData) : body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => response.statusText);
    throw new ApiError(response.status, text || response.statusText);
  }

  return (await response.json()) as T;
}

export function hasBackendConfigured(): boolean {
  return Boolean(BASE_URL);
}
