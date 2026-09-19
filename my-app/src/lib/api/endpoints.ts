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
} from './types';

/** Read endpoints degrade to mock data on any failure — never throw up to the screen. */
async function readWithFallback<T>(fn: () => Promise<T>, fallback: () => T): Promise<T> {
  if (!hasBackendConfigured()) return fallback();
  try {
    return await fn();
  } catch {
    return fallback();
  }
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

export async function getPrices(commodity: string): Promise<PricesResponse> {
  return readWithFallback(
    () => apiFetch<PricesResponse>(`/prices?commodity=${encodeURIComponent(commodity)}`),
    () => fetchGovPrices(commodity).catch(() => mockPrices(commodity)),
  );
}

export async function postSellSmart(input: SellSmartRequestInput): Promise<SellSmartResponse> {
  // Sell Smart is explicitly server-side only — no offline recompute. If the
  // backend is unreachable this throws, and the caller shows the last cached
  // result marked stale instead of a locally-guessed number.
  if (!hasBackendConfigured()) {
    return mockSellSmart(input.commodity, input.quantityKg);
  }
  return apiFetch<SellSmartResponse>('/sell-smart', { method: 'POST', body: input });
}

export async function getColdStorage(lat?: number, lng?: number): Promise<ColdStorageFacility[]> {
  return readWithFallback(
    () => apiFetch<ColdStorageFacility[]>(`/cold-storage?lat=${lat}&lng=${lng}`),
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
