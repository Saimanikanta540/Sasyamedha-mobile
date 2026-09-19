"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cacheGet, cacheSet } from "./cache";
import { useAuth } from "./auth";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T>(
  path: string,
  options: { method?: string; body?: unknown; token?: string | null } = {}
): Promise<T> {
  const { method = "GET", body, token } = options;
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, "network");
  }
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const data = await res.json();
      detail = data.detail ?? detail;
    } catch {
      // ignore parse failure
    }
    throw new ApiError(res.status, detail);
  }
  return (await res.json()) as T;
}

export async function apiUpload<T>(
  path: string,
  formData: FormData,
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { method: "POST", headers, body: formData });
  } catch {
    throw new ApiError(0, "network");
  }
  if (!res.ok) throw new ApiError(res.status, res.statusText);
  return (await res.json()) as T;
}

export function useOnline(): boolean {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    setOnline(navigator.onLine);
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    const poll = setInterval(() => setOnline(navigator.onLine), 2000);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      clearInterval(poll);
    };
  }, []);
  return online;
}

interface UseApiResult<T> {
  data: T | null;
  fetchedAt: string | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

/** Cache-first: returns cached data instantly, revalidates in the background. */
export function useApi<T>(cacheKey: string | null, path: string | null, opts?: { auth?: boolean }): UseApiResult<T> {
  const { token } = useAuth();
  const [data, setData] = useState<T | null>(null);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const nonce = useRef(0);

  const load = useCallback(() => {
    if (!path || !cacheKey) return;
    const my = ++nonce.current;
    const cached = cacheGet<T>(cacheKey);
    if (cached) {
      setData(cached.data);
      setFetchedAt(cached.fetchedAt);
      setLoading(false);
    } else {
      setLoading(true);
    }
    apiFetch<T>(path, { token: opts?.auth ? token : undefined })
      .then((fresh) => {
        if (my !== nonce.current) return;
        const entry = cacheSet(cacheKey, fresh);
        setData(entry.data);
        setFetchedAt(entry.fetchedAt);
        setError(null);
        setLoading(false);
      })
      .catch((err: ApiError) => {
        if (my !== nonce.current) return;
        setLoading(false);
        setError(err.status === 0 ? "network" : "generic");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, cacheKey, token, opts?.auth]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, cacheKey]);

  return { data, fetchedAt, loading, error, refresh: load };
}
