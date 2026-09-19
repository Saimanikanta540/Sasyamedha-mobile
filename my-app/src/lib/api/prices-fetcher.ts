import type { PricesResponse, MarketPriceRecord } from './types';

const API_KEY = '579b464db66ec23bdd000001be39649791374255750c658f851402bc';
const COMMODITY_MAP: Record<string, string> = {
  tomato: 'Tomato',
  chilli: 'Green Chilli', // Or Dry Chillies, mapping to typical data
  paddy: 'Paddy(Dhan)(Common)',
  cotton: 'Cotton',
};

export async function fetchGovPrices(commodity: string): Promise<PricesResponse> {
  const govCommodity = COMMODITY_MAP[commodity.toLowerCase()] || commodity;
  const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${API_KEY}&format=json&limit=50&filters[commodity]=${encodeURIComponent(govCommodity)}`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error('Gov API failed');
  const data = await res.json();
  
  const records: MarketPriceRecord[] = data.records.map((r: any) => ({
    market: `${r.market} (${r.district}, ${r.state})`,
    commodity,
    modalPriceRupeesPerQuintal: parseFloat(r.modal_price) || 0,
    minPriceRupeesPerQuintal: parseFloat(r.min_price) || 0,
    maxPriceRupeesPerQuintal: parseFloat(r.max_price) || 0,
    distanceKm: Math.floor(Math.random() * 50) + 5, // mock distance for now
  }));

  // deduplicate markets
  const uniqueRecords = Array.from(new Map(records.map(item => [item.market, item])).values());
  
  return {
    asOf: new Date().toISOString(),
    records: uniqueRecords,
  };
}
