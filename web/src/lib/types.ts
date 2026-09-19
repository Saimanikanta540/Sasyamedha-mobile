export interface Batch {
  id: number;
  farmer_id: number;
  crop: string;
  quantity_kg: number;
  lat: number;
  lng: number;
  status: string;
  created_at: string;
}

export interface BreakdownItem {
  label: string;
  amount: number;
  formula: string;
}

export interface SellSmartResult {
  rank: number;
  destination_type: "mandi" | "buyer" | "fpo";
  destination_id: number;
  name: string;
  name_local: string;
  price_per_kg: number;
  distance_km: number;
  gross: number;
  transport_cost: number;
  storage_cost: number;
  net_return: number;
  delta_vs_best: number;
  pickup_offered: boolean;
  phone: string;
  verified: boolean;
  breakdown: BreakdownItem[];
}

export interface SellSmartResponse {
  batch: { crop: string; quantity_kg: number; lat: number; lng: number };
  estimate_notice: string;
  results: SellSmartResult[];
}

export interface ScanResult {
  class_key: string;
  label: string;
  confidence: number;
  band: "high" | "medium" | "low";
  is_mock: boolean;
  scan_id: number;
}

export interface TreatmentRead {
  class_key: string;
  lang: string;
  crop: string;
  display_name: string;
  symptoms: string[];
  immediate_actions: string[];
  prevention: string[];
  indicative_cost_note: string;
  disclaimer: string;
}

export interface MarketPriceItem {
  market_id: number;
  market_name: string;
  market_name_local: string;
  district: string;
  commodity: string;
  variety?: string | null;
  min_price_qtl: number;
  max_price_qtl: number;
  modal_price_qtl: number;
  modal_price_kg: number;
  price_date: string;
  fetched_at: string;
  source: string;
  distance_km?: number | null;
}

export interface PricesResponse {
  fetched_at: string;
  items: MarketPriceItem[];
}

export interface PriceHistoryPoint {
  date: string;
  modal_price_qtl: number;
}

export interface BuyerItem {
  id: number;
  name: string;
  crops: string[];
  min_qty_kg?: number | null;
  max_qty_kg?: number | null;
  indicative_price_qtl: number;
  lat: number;
  lng: number;
  phone: string;
  verified: boolean;
  pickup_offered: boolean;
  district: string;
  distance_km?: number | null;
}

export interface FpoItem {
  id: number;
  name: string;
  crops: string[];
  services: string[];
  membership_note: string;
  indicative_price_qtl: number;
  lat: number;
  lng: number;
  phone: string;
  verified: boolean;
  pickup_offered: boolean;
  district: string;
  distance_km?: number | null;
}

export interface ColdStorageItem {
  id: number;
  name: string;
  lat: number;
  lng: number;
  total_capacity_kg: number;
  available_capacity_kg: number;
  crops: string[];
  cost_per_kg_per_day: number;
  phone: string;
  district: string;
  distance_km?: number | null;
  available_pct: number;
}

export interface TransportProviderItem {
  id: number;
  name: string;
  vehicle_type: string;
  capacity_kg: number;
  rate_per_km: number;
  min_fare: number;
  phone: string;
  district: string;
  estimated_cost?: number | null;
}
