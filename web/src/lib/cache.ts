export interface CacheEntry<T> {
  data: T;
  fetchedAt: string;
}

const PREFIX = "sasyamedha_cache_";

export function cacheGet<T>(key: string): CacheEntry<T> | null {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw) as CacheEntry<T>;
  } catch {
    return null;
  }
}

export function cacheSet<T>(key: string, data: T): CacheEntry<T> {
  const entry: CacheEntry<T> = { data, fetchedAt: new Date().toISOString() };
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(entry));
  } catch {
    // storage full or unavailable — cache is best-effort
  }
  return entry;
}
