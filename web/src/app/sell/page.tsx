"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import DestinationCard from "@/components/DestinationCard";
import DataAge from "@/components/DataAge";
import { useT } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { apiFetch, useApi } from "@/lib/api";
import { cacheGet, cacheSet } from "@/lib/cache";
import { cropLabel } from "@/lib/crops";
import type { Batch, SellSmartResponse } from "@/lib/types";

export default function SellPage() {
  const { t } = useT();
  const { token, farmer } = useAuth();

  const { data: batches } = useApi<Batch[]>(farmer ? "batches" : null, farmer ? "/batches" : null, {
    auth: true,
  });
  const batch = batches?.[0];

  const [crop, setCrop] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number | null>(null);
  const [resp, setResp] = useState<SellSmartResponse | null>(null);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (batch && crop === null) {
      setCrop(batch.crop);
      setQuantity(batch.quantity_kg);
    }
  }, [batch, crop]);

  useEffect(() => {
    if (!farmer || !token || !crop || !quantity) return;
    const cacheKey = `sell-smart-${crop}-${quantity}-${farmer.lat}-${farmer.lng}`;
    const cached = cacheGet<SellSmartResponse>(cacheKey);
    if (cached) {
      setResp(cached.data);
      setFetchedAt(cached.fetchedAt);
    } else {
      setLoading(true);
    }
    apiFetch<SellSmartResponse>("/sell-smart", {
      method: "POST",
      token,
      body: { crop, quantity_kg: quantity, lat: farmer.lat, lng: farmer.lng },
    })
      .then((fresh) => {
        const entry = cacheSet(cacheKey, fresh);
        setResp(entry.data);
        setFetchedAt(entry.fetchedAt);
        setError(false);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setError(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmer, token, crop, quantity]);

  return (
    <AppShell title={t("sell.title")} backHref="/">
      {crop && quantity ? (
        <div className="mb-4 flex items-end justify-between gap-3 rounded-card bg-card p-4 shadow-sm ring-1 ring-primary-700/10">
          <div>
            <p className="text-sm font-semibold text-foreground/60">{cropLabel(crop, t)}</p>
            <p className="text-2xl font-extrabold text-primary-700">{t("home.batchQuantity", { qty: quantity })}</p>
          </div>
          <label className="flex flex-col items-end text-sm">
            <span className="mb-1 font-semibold text-foreground/60">{t("sell.quantity")}</span>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value) || 1)}
              className="min-h-[44px] w-28 rounded-btn border border-primary-700/20 bg-surface px-3 text-right text-base"
            />
          </label>
        </div>
      ) : null}

      {loading && !resp ? <p className="text-foreground/60">{t("common.loading")}</p> : null}
      {error && !resp ? <p className="text-sm font-semibold text-danger">{t("errors.network")}</p> : null}

      {resp && resp.results.length === 0 ? <p className="text-foreground/70">{t("sell.noResults")}</p> : null}

      <div className="space-y-3">
        {resp?.results.map((r) => (
          <DestinationCard key={`${r.destination_type}-${r.destination_id}`} result={r} />
        ))}
      </div>

      {resp ? (
        <div className="mt-4 rounded-card bg-accent/10 p-3 text-sm text-foreground/80 ring-1 ring-accent/40">
          {resp.estimate_notice}
        </div>
      ) : null}

      <div className="mt-3">
        <DataAge fetchedAt={fetchedAt} />
      </div>
    </AppShell>
  );
}
