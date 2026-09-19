/**
 * Hand-authored against the API contract in the build brief. Once the
 * backend publishes its OpenAPI schema, replace this file with output from
 * `openapi-typescript <schema-url> -o src/lib/api/schema.ts` and re-point the
 * call sites in endpoints.ts at the generated types.
 */

export interface AuthTokens {
  accessToken: string;
}

/** `disease` is a stable slug (e.g. "late_blight") used to key treatment lookup and local i18n. */
export interface DiagnosisResult {
  disease: string;
  confidence: number;
}

export interface TreatmentCostLine {
  label: string;
  amountRupees: number;
}

export interface TreatmentGuidance {
  disease: string;
  symptoms: string[];
  immediateActions: string[];
  prevention: string[];
  indicativeCost: TreatmentCostLine[];
}

export interface MarketPriceRecord {
  market: string;
  commodity: string;
  modalPriceRupeesPerQuintal: number;
  minPriceRupeesPerQuintal: number;
  maxPriceRupeesPerQuintal: number;
  distanceKm?: number;
}

export interface PricesResponse {
  asOf: string; // ISO timestamp
  records: MarketPriceRecord[];
}

export interface SellSmartRequestInput {
  commodity: string;
  quantityKg: number;
  location?: { lat: number; lng: number };
}

export interface SellDestinationBreakdown {
  grossValueRupees: number;
  transportCostRupees: number;
  storageCostRupees: number;
  marketMarginRupees: number;
}

export type DestinationType = 'mandi' | 'fpo' | 'buyer' | 'cold_storage';

export interface SellDestination {
  id: string;
  name: string;
  type: DestinationType;
  netReturnRupees: number;
  breakdown: SellDestinationBreakdown;
  buyerId?: string;
}

export interface SellSmartResponse {
  calculatedAt: string; // ISO timestamp
  commodity: string;
  quantityKg: number;
  destinations: SellDestination[];
}

export interface ColdStorageFacility {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distanceKm: number;
  capacityTonnes: number;
  availableTonnes: number;
  costPerDayRupeesPerQuintal: number;
}

export interface TransportRequestInput {
  commodity: string;
  quantityKg: number;
  pickupLocation: string;
  deliveryLocation: string;
  preferredSchedule: string;
}

export interface TransportRequestResult {
  referenceNumber: string;
  status: 'queued' | 'confirmed';
}

export interface ScanHistoryServerEntry {
  id: string;
  disease: string;
  confidence: number;
  capturedAt: string;
  imageUrl?: string;
}

export interface BuyerContact {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  cropsAccepted: string[];
  quantityRangeKg: [number, number];
  phone: string;
}
