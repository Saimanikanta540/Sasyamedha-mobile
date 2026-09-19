/**
 * Deterministic local data used whenever no backend is configured or a
 * request fails offline. Keeps every screen demoable and keeps "no blank
 * screen" true even with EXPO_PUBLIC_API_BASE_URL unset.
 */
import type {
  BuyerContact,
  ColdStorageFacility,
  MarketPriceRecord,
  PricesResponse,
  SellSmartResponse,
  TransportRequestResult,
  TreatmentGuidance,
} from './types';

export const KNOWN_DISEASES = ['late_blight', 'leaf_curl_virus', 'healthy'] as const;

export const MOCK_TREATMENTS: Record<string, TreatmentGuidance> = {
  late_blight: {
    disease: 'late_blight',
    symptoms: [
      'Dark, water-soaked patches on leaves',
      'White fungal growth on the underside of leaves in humid weather',
      'Brown lesions spreading to stems and fruit',
    ],
    immediateActions: [
      'Remove and burn visibly infected leaves and fruit',
      'Spray a copper-based fungicide within 24 hours',
      'Avoid overhead irrigation until the spray has dried',
      'Improve spacing between plants for airflow',
    ],
    prevention: [
      'Rotate crops away from tomato/potato family for 2 seasons',
      'Use certified disease-free seedlings',
      'Apply preventive copper spray before the monsoon onset',
    ],
    indicativeCost: [
      { label: 'Copper fungicide (1 acre)', amountRupees: 450 },
      { label: 'Labour for spraying', amountRupees: 300 },
    ],
  },
  leaf_curl_virus: {
    disease: 'leaf_curl_virus',
    symptoms: [
      'Upward curling and crinkling of young leaves',
      'Stunted plant growth',
      'Yellowing along leaf veins',
    ],
    immediateActions: [
      'Uproot and destroy severely affected plants',
      'Control whitefly with a neem-oil spray',
      'Install yellow sticky traps around the field border',
    ],
    prevention: [
      'Use virus-resistant seed varieties next season',
      'Keep field borders free of weeds that host whitefly',
    ],
    indicativeCost: [
      { label: 'Neem oil spray (1 acre)', amountRupees: 320 },
      { label: 'Sticky traps (pack of 20)', amountRupees: 260 },
    ],
  },
};

export function mockDiagnose(): { disease: string; confidence: number } {
  return { disease: 'late_blight', confidence: 0.82 };
}

export function mockTreatment(disease: string): TreatmentGuidance {
  return MOCK_TREATMENTS[disease] ?? MOCK_TREATMENTS.late_blight;
}

const MOCK_MARKETS: Array<{ market: string; distanceKm: number }> = [
  { market: 'Guntur Mandi', distanceKm: 6 },
  { market: 'Vijayawada Mandi', distanceKm: 34 },
  { market: 'Tenali Mandi', distanceKm: 18 },
  { market: 'Mangalagiri Mandi', distanceKm: 12 },
];

export function mockPrices(commodity: string): PricesResponse {
  const base: Record<string, number> = {
    tomato: 1800,
    chilli: 14500,
    paddy: 2200,
    cotton: 6800,
  };
  const modal = base[commodity] ?? 2000;
  const records: MarketPriceRecord[] = MOCK_MARKETS.map((m, i) => ({
    market: m.market,
    commodity,
    modalPriceRupeesPerQuintal: modal - i * 60,
    minPriceRupeesPerQuintal: modal - i * 60 - 200,
    maxPriceRupeesPerQuintal: modal - i * 60 + 250,
    distanceKm: m.distanceKm,
  }));
  return { asOf: new Date().toISOString(), records };
}

export function mockSellSmart(commodity: string, quantityKg: number): SellSmartResponse {
  const perKg = (mockPrices(commodity).records[0].modalPriceRupeesPerQuintal ?? 2000) / 100;
  const gross = perKg * quantityKg;
  const destinations = [
    {
      id: 'mandi-guntur',
      name: 'Guntur Mandi',
      type: 'mandi' as const,
      transport: 180,
      storage: 0,
      margin: gross * 0.02,
    },
    {
      id: 'fpo-guntur-farmers',
      name: 'Guntur Farmers FPO',
      type: 'fpo' as const,
      transport: 90,
      storage: 0,
      margin: gross * 0.01,
      buyerId: 'fpo-guntur-farmers',
    },
    {
      id: 'buyer-freshharvest',
      name: 'FreshHarvest Traders',
      type: 'buyer' as const,
      transport: 260,
      storage: 40,
      margin: gross * 0.035,
      buyerId: 'buyer-freshharvest',
    },
  ].map((d) => ({
    id: d.id,
    name: d.name,
    type: d.type,
    buyerId: 'buyerId' in d ? d.buyerId : undefined,
    breakdown: {
      grossValueRupees: Math.round(gross),
      transportCostRupees: d.transport,
      storageCostRupees: d.storage,
      marketMarginRupees: Math.round(d.margin),
    },
    netReturnRupees: Math.round(gross - d.transport - d.storage - d.margin),
  }));

  destinations.sort((a, b) => b.netReturnRupees - a.netReturnRupees);

  return {
    calculatedAt: new Date().toISOString(),
    commodity,
    quantityKg,
    destinations,
  };
}

export function mockColdStorage(): ColdStorageFacility[] {
  return [
    {
      id: 'cs-guntur-1',
      name: 'Guntur Municipal Cold Storage',
      lat: 16.3067,
      lng: 80.4365,
      distanceKm: 4.2,
      capacityTonnes: 500,
      availableTonnes: 200,
      costPerDayRupeesPerQuintal: 3.5,
    },
    {
      id: 'cs-tenali-1',
      name: 'Tenali AgriCold Facility',
      lat: 16.2431,
      lng: 80.6423,
      distanceKm: 17.8,
      capacityTonnes: 300,
      availableTonnes: 45,
      costPerDayRupeesPerQuintal: 3.0,
    },
    {
      id: 'cs-mangalagiri-1',
      name: 'Mangalagiri Farmers Cold Store',
      lat: 16.4307,
      lng: 80.5525,
      distanceKm: 11.1,
      capacityTonnes: 200,
      availableTonnes: 160,
      costPerDayRupeesPerQuintal: 4.0,
    },
  ];
}

export function mockBuyer(id: string): BuyerContact {
  const byId: Record<string, BuyerContact> = {
    'fpo-guntur-farmers': {
      id,
      name: 'Guntur Farmers FPO',
      address: 'Near APMC Yard, Guntur',
      lat: 16.3067,
      lng: 80.4365,
      cropsAccepted: ['tomato', 'chilli'],
      quantityRangeKg: [100, 5000],
      phone: '+919000000001',
      verified: true,
    },
    'buyer-freshharvest': {
      id,
      name: 'FreshHarvest Traders',
      address: 'Autonagar, Vijayawada',
      lat: 16.5062,
      lng: 80.648,
      cropsAccepted: ['tomato', 'cotton'],
      quantityRangeKg: [500, 20000],
      phone: '+919000000002',
      verified: true,
    },
  };
  return byId[id] ?? byId['fpo-guntur-farmers'];
}

export function mockBuyerList(): BuyerContact[] {
  return [mockBuyer('buyer-freshharvest')];
}

export function mockFpoList(): BuyerContact[] {
  return [mockBuyer('fpo-guntur-farmers')];
}

export function mockTransportRequest(): TransportRequestResult {
  return {
    referenceNumber: `TR-${Date.now().toString(36).toUpperCase()}`,
    status: 'queued',
  };
}
