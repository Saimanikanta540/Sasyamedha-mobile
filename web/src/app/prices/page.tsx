"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import DataAge from "@/components/DataAge";
import Sparkline from "@/components/Sparkline";
import { useT } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useApi, apiFetch } from "@/lib/api";
import type { MarketPriceItem, PriceHistoryPoint, PricesResponse } from "@/lib/types";

function isStale(priceDate: string): boolean {
  const days = (Date.now() - new Date(priceDate).getTime()) / 86400000;
  return days > 1;
}

export default function PricesPage() {
  const { t, lang } = useT();
  const { farmer } = useAuth();
  const [commodity, setCommodity] = useState("");
  const [district, setDistrict] = useState("");
  const [sort, setSort] = useState<"price" | "distance">("price");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [history, setHistory] = useState<Record<number, PriceHistoryPoint[]>>({});

  const qs = new URLSearchParams();
  if (commodity) qs.set("commodity", commodity);
  if (district) qs.set("district", district);
  qs.set("sort", sort);
  qs.set("lang", lang);
  if (farmer) {
    qs.set("lat", String(farmer.lat));
    qs.set("lng", String(farmer.lng));
  }

  const { data, fetchedAt, loading } = useApi<PricesResponse>(
    `prices-${qs.toString()}`,
    `/prices?${qs.toString()}`
  );

  const items = data?.items ?? [];
  const commodities = useMemo(() => Array.from(new Set(items.map((i) => i.commodity))), [items]);
  const districts = useMemo(() => Array.from(new Set(items.map((i) => i.district))), [items]);
  const sourceDate = items[0]?.price_date;

  async function toggle(item: MarketPriceItem) {
    if (expanded === item.market_id) {
      setExpanded(null);
      return;
    }
    setExpanded(item.market_id);
    if (!history[item.market_id]) {
      try {
        const points = await apiFetch<PriceHistoryPoint[]>(
          `/prices/history?market_id=${item.market_id}&commodity=${item.commodity}`
        );
        setHistory((h) => ({ ...h, [item.market_id]: points }));
      } catch {
        // leave sparkline absent on failure
      }
    }
  }

  return (
    <AppShell title={t("prices.title")} backHref="/">
      {sourceDate ? (
        <p className="mb-3 text-sm font-semibold text-foreground/60">
          {t("prices.sourceDate", { date: sourceDate })}
        </p>
      ) : null}

      <div className="mb-4 flex flex-wrap gap-2">
        <select
          value={commodity}
          onChange={(e) => setCommodity(e.target.value)}
          className="min-h-[44px] rounded-btn border border-primary-700/20 bg-card px-3 text-sm"
        >
          <option value="">{t("prices.allCommodities")}</option>
          {commodities.map((c) => (
            <option key={c} value={c}>
              {c[0].toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>
        <select
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          className="min-h-[44px] rounded-btn border border-primary-700/20 bg-card px-3 text-sm"
        >
          <option value="">{t("prices.allDistricts")}</option>
          {districts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setSort(sort === "price" ? "distance" : "price")}
          className="min-h-[44px] rounded-btn border border-primary-700/20 bg-card px-3 text-sm font-semibold text-primary-700"
        >
          {sort === "price" ? t("prices.sortPrice") : t("prices.sortDistance")}
        </button>
      </div>

      {loading && !data ? <p className="text-foreground/60">{t("common.loading")}</p> : null}

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={`${item.market_id}-${item.commodity}`}
            className="rounded-card bg-card p-4 shadow-sm ring-1 ring-primary-700/10"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-base font-bold text-primary-700">{item.market_name_local}</p>
                <p className="text-xs text-foreground/60">
                  {item.district}
                  {item.distance_km != null ? ` · ${item.distance_km} ${t("common.km")}` : ""}
                </p>
              </div>
              {isStale(item.price_date) ? (
                <span className="rounded-full bg-danger/10 px-2 py-1 text-xs font-semibold text-danger">
                  {t("prices.stale")}
                </span>
              ) : null}
            </div>

            <div className="mt-2 flex items-end justify-between">
              <div>
                <p className="text-2xl font-extrabold text-primary-700">
                  ₹{item.modal_price_qtl.toLocaleString("en-IN")}{" "}
                  <span className="text-sm font-medium text-foreground/60">{t("prices.perQuintal")}</span>
                </p>
                <p className="text-sm text-foreground/70">
                  ₹{item.modal_price_kg} {t("prices.perKg")}
                </p>
                <p className="text-xs text-foreground/50">
                  ₹{item.min_price_qtl.toLocaleString("en-IN")} – ₹
                  {item.max_price_qtl.toLocaleString("en-IN")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggle(item)}
                className="min-h-[44px] rounded-btn border border-primary-400/40 px-3 text-sm font-semibold text-primary-600"
              >
                {t("prices.trend")}
              </button>
            </div>

            {expanded === item.market_id ? (
              <div className="mt-3 border-t border-primary-700/10 pt-3">
                {history[item.market_id] ? (
                  <Sparkline values={history[item.market_id].map((p) => p.modal_price_qtl)} />
                ) : (
                  <p className="text-sm text-foreground/60">{t("common.loading")}</p>
                )}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-4">
        <DataAge fetchedAt={fetchedAt} />
      </div>
    </AppShell>
  );
}
