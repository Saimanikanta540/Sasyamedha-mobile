import { apiFetch, hasBackendConfigured } from './client';
import { fetchGovPrices } from './prices-fetcher';
import {
  mockBuyer,
  mockColdStorage,
  mockDiagnose,
  mockPrices,
  mockSellSmart,
  mockTransportRequest,
  mockTreatment,
} from './mock-data';
import type {
  AuthTokens,
  BuyerContact,
  ColdStorageFacility,
  DiagnosisResult,
  PricesResponse,
  ScanHistoryServerEntry,
  SellSmartRequestInput,
  SellSmartResponse,
  TransportRequestInput,
  TransportRequestResult,
  TreatmentGuidance,
  VoiceTranscription,
} from './types';

/** Read endpoints degrade to mock data on any failure — never throw up to the screen. */
async function readWithFallback<T>(fn: () => Promise<T>, fallback: () => T | Promise<T>): Promise<T> {
  if (!hasBackendConfigured()) return fallback();
  try {
    return await fn();
  } catch {
    return fallback();
  }
}

/**
 * The server's actual response/request field names (snake_case, its own shapes) —
 * distinct from the camelCase types in ./types.ts, which is hand-authored against
 * the original build brief per that file's own header comment. These `Server*`
 * shapes are only ever seen inside this module; every exported function below
 * adapts them into the stable client-facing types so screens don't change.
 */
interface ServerMandiPrice {
  commodity: string;
  variety: string;
  state: string;
  district: string;
  market: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  distance_km: number | null;
}

interface ServerColdStorage {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  total_capacity_kg: number;
  available_capacity_kg: number;
  cost_per_kg_per_day: number;
  distance_km: number | null;
}

interface ServerSellSmartDestination {
  destination_id: string;
  type: string;
  name: string;
  price_per_kg: number;
  breakdown: {
    gross_revenue: number;
    transport_cost: number;
    storage_cost: number;
    net_return: number;
    delta_from_best: number;
  };
}

interface ServerSellSmartResponse {
  results: ServerSellSmartDestination[];
}

export async function login(username: string, password: string): Promise<AuthTokens> {
  if (!hasBackendConfigured()) {
    // Demo mode: accept any credentials so the flow is fully walkable offline.
    return { accessToken: `demo.${Date.now()}` };
  }
  return apiFetch<AuthTokens>('/auth/login', {
    method: 'POST',
    body: { username, password },
    auth: false,
  });
}

export async function diagnose(photoUri: string): Promise<DiagnosisResult> {
  return readWithFallback(async () => {
    const form = new FormData();
    form.append('image', {
      uri: photoUri,
      name: 'leaf.jpg',
      type: 'image/jpeg',
    } as unknown as Blob);
    return apiFetch<DiagnosisResult>('/diagnose', { method: 'POST', body: form, isMultipart: true });
  }, mockDiagnose);
}

export async function getTreatment(disease: string): Promise<TreatmentGuidance> {
  return readWithFallback(
    () => apiFetch<TreatmentGuidance>(`/treatment/${encodeURIComponent(disease)}`),
    () => mockTreatment(disease),
  );
}

export async function getPrices(commodity: string, lat?: number, lng?: number): Promise<PricesResponse> {
  return readWithFallback(
    async () => {
      const params = new URLSearchParams({ commodity });
      if (lat != null && lng != null) {
        params.set('lat', String(lat));
        params.set('lng', String(lng));
        params.set('sort_by', 'distance');
      }
      const rows = await apiFetch<ServerMandiPrice[]>(`/prices?${params.toString()}`);
      return {
        asOf: new Date().toISOString(),
        records: rows.map((r) => ({
          market: r.market,
          commodity: r.commodity,
          modalPriceRupeesPerQuintal: r.modal_price,
          minPriceRupeesPerQuintal: r.min_price,
          maxPriceRupeesPerQuintal: r.max_price,
          distanceKm: r.distance_km ?? undefined,
        })),
      };
    },
    () => fetchGovPrices(commodity).catch(() => mockPrices(commodity)),
  );
}

export async function postSellSmart(input: SellSmartRequestInput): Promise<SellSmartResponse> {
  // Sell Smart is explicitly server-side only — no offline recompute. If the
  // backend is unreachable this throws, and the caller shows the last cached
  // result marked stale instead of a locally-guessed number.
  if (!hasBackendConfigured() || !input.location) {
    return mockSellSmart(input.commodity, input.quantityKg);
  }
  const server = await apiFetch<ServerSellSmartResponse>('/sell-smart', {
    method: 'POST',
    body: {
      commodity: input.commodity,
      quantity_kg: input.quantityKg,
      farmer_lat: input.location.lat,
      farmer_lng: input.location.lng,
    },
  });
  return {
    calculatedAt: new Date().toISOString(),
    commodity: input.commodity,
    quantityKg: input.quantityKg,
    destinations: server.results.map((r) => ({
      id: r.destination_id,
      name: r.name,
      type: r.type as SellSmartResponse['destinations'][number]['type'],
      netReturnRupees: r.breakdown.net_return,
      breakdown: {
        grossValueRupees: r.breakdown.gross_revenue,
        transportCostRupees: r.breakdown.transport_cost,
        storageCostRupees: r.breakdown.storage_cost,
        // The server doesn't model a separate market-margin deduction — gross
        // minus transport minus storage already equals net_return exactly.
        marketMarginRupees: 0,
      },
    })),
  };
}

export async function getColdStorage(lat?: number, lng?: number): Promise<ColdStorageFacility[]> {
  return readWithFallback(
    async () => {
      const params = new URLSearchParams();
      if (lat != null && lng != null) {
        params.set('lat', String(lat));
        params.set('lng', String(lng));
      }
      const qs = params.toString();
      const rows = await apiFetch<ServerColdStorage[]>(`/cold-storage${qs ? `?${qs}` : ''}`);
      return rows.map((r) => ({
        id: r.id,
        name: r.name,
        lat: r.latitude,
        lng: r.longitude,
        distanceKm: r.distance_km ?? 0,
        capacityTonnes: r.total_capacity_kg / 1000,
        availableTonnes: r.available_capacity_kg / 1000,
        // cost_per_kg_per_day -> per-quintal (100 kg) to match this screen's unit.
        costPerDayRupeesPerQuintal: r.cost_per_kg_per_day * 100,
      }));
    },
    mockColdStorage,
  );
}

export async function postTransportRequest(
  input: TransportRequestInput,
): Promise<TransportRequestResult> {
  if (!hasBackendConfigured()) {
    return mockTransportRequest();
  }
  return apiFetch<TransportRequestResult>('/transport-request', { method: 'POST', body: input });
}

export async function getScanHistory(): Promise<ScanHistoryServerEntry[]> {
  return readWithFallback(
    () => apiFetch<ScanHistoryServerEntry[]>('/scan-history'),
    () => [],
  );
}

export async function getBuyer(id: string): Promise<BuyerContact> {
  return readWithFallback(
    () => apiFetch<BuyerContact>(`/buyers/${encodeURIComponent(id)}`),
    () => mockBuyer(id),
  );
}

interface ServerVoiceTranscription {
  transcript: string;
  transcript_en: string;
  language_guess: string;
}

/**
 * No offline/mock fallback here, unlike the other endpoints — there is no
 * sensible way to fake "understanding what was said". Throws on failure
 * (no backend configured, no network, or the server had no Gemini key
 * configured and 503'd); the Voice screen shows a clear retry state instead.
 */
export async function transcribeVoice(audioUri: string): Promise<VoiceTranscription> {
  const form = new FormData();
  form.append('file', {
    uri: audioUri,
    name: 'voice.m4a',
    type: 'audio/mp4',
  } as unknown as Blob);
  const server = await apiFetch<ServerVoiceTranscription>('/voice/transcribe', {
    method: 'POST',
    body: form,
    isMultipart: true,
  });
  return {
    transcript: server.transcript,
    transcriptEn: server.transcript_en,
    languageGuess: server.language_guess,
  };
}
