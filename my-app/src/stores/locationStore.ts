import * as Location from 'expo-location';
import { create } from 'zustand';

/** KL University (Koneru Lakshmaiah Education Foundation), Vaddeswaram — used
 * only when live location is denied/unavailable, so distance-sorted screens
 * (Prices, Sell Smart, Cold Storage) always have *something* to call the
 * backend with rather than skipping the request entirely. Verified via
 * Nominatim (lat/lng for the actual campus POI, not just the general area). */
const FALLBACK = { lat: 16.4422073, lng: 80.6253234 };
const LOCATE_TIMEOUT_MS = 5000;

type LocationStatus = 'idle' | 'loading' | 'live' | 'denied' | 'unavailable';

interface LocationState {
  lat: number;
  lng: number;
  status: LocationStatus;
  /** True once we have a real device fix (not the fallback). */
  isLive: boolean;
  /** Best-effort only: resolves to the fallback on denied permission, disabled
   * location services, a stuck fix, or any failure — never throws, never blocks
   * the caller past LOCATE_TIMEOUT_MS. Safe to call repeatedly (e.g. pull-to-refresh);
   * a call already in flight is reused rather than starting a second one. */
  requestLocation: () => Promise<void>;
}

let inFlight: Promise<void> | null = null;

export const useLocationStore = create<LocationState>((set) => ({
  lat: FALLBACK.lat,
  lng: FALLBACK.lng,
  status: 'idle',
  isLive: false,
  requestLocation: async () => {
    if (inFlight) return inFlight;

    set({ status: 'loading' });
    inFlight = (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          set({ status: 'denied', lat: FALLBACK.lat, lng: FALLBACK.lng, isLive: false });
          return;
        }

        const enabled = await Location.hasServicesEnabledAsync();
        if (!enabled) {
          set({ status: 'unavailable', lat: FALLBACK.lat, lng: FALLBACK.lng, isLive: false });
          return;
        }

        const timeout = new Promise<null>((resolve) => {
          setTimeout(() => resolve(null), LOCATE_TIMEOUT_MS);
        });
        const position = await Promise.race([
          Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
          timeout,
        ]);

        if (!position) {
          set({ status: 'unavailable', lat: FALLBACK.lat, lng: FALLBACK.lng, isLive: false });
          return;
        }

        set({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          status: 'live',
          isLive: true,
        });
      } catch {
        set({ status: 'unavailable', lat: FALLBACK.lat, lng: FALLBACK.lng, isLive: false });
      } finally {
        inFlight = null;
      }
    })();
    return inFlight;
  },
}));
