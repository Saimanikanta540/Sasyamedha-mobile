import AsyncStorage from '@react-native-async-storage/async-storage';

import { queryClient } from './query-client';

const QUERY_CACHE_KEY = 'scc.query-cache';
const LAST_SYNC_KEY = 'scc.lastSyncAt';

export async function getCacheSizeKb(): Promise<number> {
  const raw = await AsyncStorage.getItem(QUERY_CACHE_KEY);
  if (!raw) return 0;
  return Math.round((raw.length / 1024) * 10) / 10;
}

export async function getLastSyncAt(): Promise<string | null> {
  return AsyncStorage.getItem(LAST_SYNC_KEY);
}

export async function markSynced(): Promise<void> {
  await AsyncStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
}

/** Clears cached prices/treatment/sell data only — never the auth token or the outbox. */
export async function clearCache(): Promise<void> {
  queryClient.clear();
  await AsyncStorage.removeItem(QUERY_CACHE_KEY);
  await AsyncStorage.removeItem(LAST_SYNC_KEY);
}
