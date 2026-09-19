import { create } from 'zustand';

/** The commodity + quantity a user is currently working with, carried forward across the
 * Sell Smart → Destination Detail → Store/Transport chain so those screens never re-ask. */
interface SessionState {
  commodity: string | null;
  quantityKg: number | null;
  set: (commodity: string, quantityKg: number) => void;
  reset: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  commodity: null,
  quantityKg: null,
  set: (commodity, quantityKg) => set({ commodity, quantityKg }),
  reset: () => set({ commodity: null, quantityKg: null }),
}));
