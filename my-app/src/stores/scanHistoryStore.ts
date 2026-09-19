import { create } from 'zustand';

import {
  deleteScan,
  getScan,
  insertScan,
  listScans,
  PENDING_DISEASE,
  ScanEntry,
  updateScanResult,
} from '@/lib/storage/scan-history';

interface ScanHistoryState {
  scans: ScanEntry[];
  loaded: boolean;
  load: () => Promise<void>;
  addPending: (id: string, imageUri: string) => Promise<ScanEntry>;
  addComplete: (
    id: string,
    imageUri: string,
    disease: string,
    confidence: number,
  ) => Promise<ScanEntry>;
  resolvePending: (id: string, disease: string, confidence: number) => Promise<void>;
  remove: (id: string) => Promise<void>;
  getById: (id: string) => ScanEntry | undefined;
}

export const useScanHistoryStore = create<ScanHistoryState>((set, get) => ({
  scans: [],
  loaded: false,
  load: async () => {
    const scans = await listScans();
    set({ scans, loaded: true });
  },
  addPending: async (id, imageUri) => {
    const entry: ScanEntry = {
      id,
      disease: PENDING_DISEASE,
      confidence: -1,
      imageUri,
      capturedAt: new Date().toISOString(),
    };
    await insertScan(entry);
    set((state) => ({ scans: [entry, ...state.scans.filter((s) => s.id !== id)] }));
    return entry;
  },
  addComplete: async (id, imageUri, disease, confidence) => {
    const entry: ScanEntry = {
      id,
      disease,
      confidence,
      imageUri,
      capturedAt: new Date().toISOString(),
    };
    await insertScan(entry);
    set((state) => ({ scans: [entry, ...state.scans.filter((s) => s.id !== id)] }));
    return entry;
  },
  resolvePending: async (id, disease, confidence) => {
    await updateScanResult(id, disease, confidence);
    set((state) => ({
      scans: state.scans.map((s) => (s.id === id ? { ...s, disease, confidence } : s)),
    }));
  },
  remove: async (id) => {
    await deleteScan(id);
    set((state) => ({ scans: state.scans.filter((s) => s.id !== id) }));
  },
  getById: (id) => get().scans.find((s) => s.id === id),
}));

/** Loads a single scan directly from storage, bypassing the in-memory list — used when
 * the store hasn't been hydrated yet (e.g. a cold-launch deep link into replay mode). */
export async function loadScanById(id: string): Promise<ScanEntry | null> {
  const cached = useScanHistoryStore.getState().getById(id);
  if (cached) return cached;
  return getScan(id);
}
