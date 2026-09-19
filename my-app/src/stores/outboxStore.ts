import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef } from 'react';
import { create } from 'zustand';

import { diagnose, postTransportRequest } from '@/lib/api/endpoints';
import type { TransportRequestInput } from '@/lib/api/types';
import { generateId } from '@/lib/id';
import { useIsOnline } from '@/lib/network/connectivity';
import {
  enqueueOutbox,
  listOutbox,
  markOutboxSynced,
  OutboxEntry,
  removeOutboxEntry,
} from '@/lib/storage/outbox';
import { useScanHistoryStore } from '@/stores/scanHistoryStore';

const NOTIFICATIONS_KEY = 'scc.notificationsEnabled';

interface DiagnosePayload {
  scanId: string;
  imageUri: string;
}

interface OutboxState {
  entries: OutboxEntry[];
  loaded: boolean;
  load: () => Promise<void>;
  enqueueTransport: (input: TransportRequestInput) => Promise<string>;
  enqueueDiagnose: (payload: DiagnosePayload) => Promise<string>;
}

export const useOutboxStore = create<OutboxState>((set, get) => ({
  entries: [],
  loaded: false,
  load: async () => {
    const entries = await listOutbox();
    set({ entries: entries.filter((e) => e.status === 'pending'), loaded: true });
  },
  enqueueTransport: async (input) => {
    const id = generateId('outbox');
    const entry = await enqueueOutbox(id, 'transport', input as unknown as Record<string, unknown>);
    set((state) => ({ entries: [...state.entries, entry] }));
    return id;
  },
  enqueueDiagnose: async (payload) => {
    const id = generateId('outbox');
    const entry = await enqueueOutbox(id, 'diagnose', payload as unknown as Record<string, unknown>);
    set((state) => ({ entries: [...state.entries, entry] }));
    return id;
  },
}));

export function usePendingRequests() {
  const entries = useOutboxStore((s) => s.entries);
  return { entries, count: entries.length };
}

async function notifySynced(title: string, body: string) {
  try {
    const enabled = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
    if (enabled !== 'true') return;
    // Loaded lazily so the notifications native module is never touched during app
    // boot (Expo Go on newer Android SDKs throws on eager import) — only when a
    // sync actually needs to fire a notification.
    const Notifications = await import('expo-notifications');
    await Notifications.scheduleNotificationAsync({ content: { title, body }, trigger: null });
  } catch {
    // Local notification is a nice-to-have — never block the sync on it.
  }
}

async function syncOne(entry: OutboxEntry): Promise<void> {
  if (entry.kind === 'transport') {
    const result = await postTransportRequest(entry.payload as unknown as TransportRequestInput);
    await markOutboxSynced(entry.id, result.referenceNumber);
    await removeOutboxEntry(entry.id);
    await notifySynced('Transport request confirmed', `Reference ${result.referenceNumber} is ready.`);
  } else {
    const { scanId, imageUri } = entry.payload as unknown as DiagnosePayload;
    const result = await diagnose(imageUri);
    await useScanHistoryStore.getState().resolvePending(scanId, result.disease, result.confidence);
    await removeOutboxEntry(entry.id);
    await notifySynced('Diagnosis ready', 'Your pending crop scan has been analyzed.');
  }
}

/** Flushes pending outbox entries whenever connectivity returns. Mount once at the app root. */
export function useOutboxSync() {
  const isOnline = useIsOnline();
  const load = useOutboxStore((s) => s.load);
  const loaded = useOutboxStore((s) => s.loaded);
  const syncing = useRef(false);

  useEffect(() => {
    if (!loaded) load();
  }, [loaded, load]);

  useEffect(() => {
    if (!isOnline || !loaded || syncing.current) return;
    const pending = useOutboxStore.getState().entries;
    if (pending.length === 0) return;

    syncing.current = true;
    (async () => {
      for (const entry of pending) {
        try {
          await syncOne(entry);
          useOutboxStore.setState((state) => ({
            entries: state.entries.filter((e) => e.id !== entry.id),
          }));
        } catch {
          // Leave it queued — retried on the next reconnect.
        }
      }
      syncing.current = false;
    })();
  }, [isOnline, loaded]);
}
