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

// Matches the server's real 6-class tomato model exactly (app/services/
// ml_inference.py / app/seed/treatment_seed.py) — was 3 classes with a
// different name for the virus class ('leaf_curl_virus' vs the server's
// 'yellow_leaf_curl_virus') before this, left over from before real
// diagnosis existed. Real online diagnosis already returns the server's
// keys untouched regardless of this list, but the Treat tile's manual
// browse picker is driven directly by KNOWN_DISEASES, and this file is
// also every offline/no-backend fallback.
export const KNOWN_DISEASES = [
  'healthy',
  'early_blight',
  'late_blight',
  'target_spot',
  'yellow_leaf_curl_virus',
  'mosaic_virus',
] as const;

export const MOCK_TREATMENTS: Record<string, TreatmentGuidance> = {
  early_blight: {
    disease: 'early_blight',
    symptoms: [
      'Brown spots with concentric rings on older, lower leaves',
      'Yellowing around the spots',
      'Leaves dry out and fall early',
    ],
    immediateActions: [
      'Remove and burn the badly affected lower leaves',
      'Water at the base only, never over the leaves',
      'Spray a copper-based fungicide, following the dosage on the label',
      'Repeat after 7 days if new spots appear',
    ],
    prevention: [
      'Rotate tomato with a non-solanaceous crop',
      'Keep 60cm spacing so leaves dry quickly',
      'Mulch to stop soil splashing onto leaves',
    ],
    indicativeCost: [
      { label: 'Copper fungicide (1 acre)', amountRupees: 400 },
      { label: 'Labour for spraying', amountRupees: 300 },
    ],
  },
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
  target_spot: {
    disease: 'target_spot',
    symptoms: [
      'Small brown spots with concentric rings, like a target',
      'Spots merge into larger patches on older leaves',
      'Yellowing and early leaf drop',
    ],
    immediateActions: [
      'Remove severely spotted leaves and destroy them away from the field',
      'Avoid overhead watering',
      'Spray a copper-based fungicide, following the dosage on the label',
    ],
    prevention: [
      'Rotate with a non-solanaceous crop',
      'Stake plants to improve air circulation',
      'Avoid excess nitrogen fertiliser',
    ],
    indicativeCost: [
      { label: 'Copper fungicide (1 acre)', amountRupees: 400 },
      { label: 'Labour for spraying', amountRupees: 300 },
    ],
  },
  yellow_leaf_curl_virus: {
    disease: 'yellow_leaf_curl_virus',
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
  mosaic_virus: {
    disease: 'mosaic_virus',
    symptoms: [
      'Mottled light and dark green pattern on leaves',
      'Leaves curled, narrow or misshapen',
      'Stunted growth and reduced yield',
    ],
    immediateActions: [
      'Uproot and destroy infected plants — there is no cure',
      'Wash hands and tools with soap after handling infected plants',
      'Control aphids with a recommended insecticide',
    ],
    prevention: [
      'Use certified virus-free seed',
      'Control weeds that can host the virus',
    ],
    indicativeCost: [{ label: 'Aphid control (1 acre)', amountRupees: 280 }],
  },
  healthy: {
    disease: 'healthy',
    symptoms: ['Leaves are deep green and evenly coloured', 'No spots, wilting or curling'],
    immediateActions: ['No treatment needed right now', 'Check the plant again in 5–7 days'],
    prevention: ['Rotate crops each season', 'Keep adequate spacing between plants'],
    indicativeCost: [],
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
      indicativePricePerKg: 17,
      distanceKm: 3,
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
      indicativePricePerKg: 18,
      distanceKm: 34,
    },
    'buyer-sunrise-traders': {
      id,
      name: 'Sunrise Traders',
      address: 'Market Yard, Tenali',
      lat: 16.243,
      lng: 80.64,
      cropsAccepted: ['chilli', 'paddy'],
      quantityRangeKg: [200, 8000],
      phone: '+919000000003',
      verified: false,
      indicativePricePerKg: 22,
      distanceKm: 18,
    },
    'fpo-krishna-valley': {
      id,
      name: 'Krishna Valley Farmer Producer Organization',
      address: 'Near Krishna Canal, Guntur',
      lat: 16.35,
      lng: 80.5,
      cropsAccepted: ['tomato', 'chilli'],
      quantityRangeKg: [100, 10000],
      phone: '+919000000004',
      verified: true,
      indicativePricePerKg: 16.5,
      distanceKm: 8,
    },
  };
  return byId[id] ?? byId['fpo-guntur-farmers'];
}

export function mockBuyerList(): BuyerContact[] {
  return [mockBuyer('buyer-freshharvest'), mockBuyer('buyer-sunrise-traders')];
}

export function mockFpoList(): BuyerContact[] {
  return [mockBuyer('fpo-guntur-farmers'), mockBuyer('fpo-krishna-valley')];
}

export function mockTransportRequest(): TransportRequestResult {
  return {
    referenceNumber: `TR-${Date.now().toString(36).toUpperCase()}`,
    status: 'queued',
  };
}
