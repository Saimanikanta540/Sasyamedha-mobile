"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import DataAge from "@/components/DataAge";
import { useT } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useApi, apiFetch } from "@/lib/api";
import type { Batch, TransportProviderItem } from "@/lib/types";

export default function TransportPage() {
  const { t } = useT();
  const { farmer, token } = useAuth();

  const { data: batches } = useApi<Batch[]>(farmer ? "batches" : null, farmer ? "/batches" : null, {
    auth: true,
  });
  const batch = batches?.[0];
  const quantity = batch?.quantity_kg ?? 0;

  const qs = farmer
    ? `?quantity_kg=${quantity}&lat=${farmer.lat}&lng=${farmer.lng}`
    : "";
  const { data, fetchedAt, loading } = useApi<TransportProviderItem[]>(
    farmer ? `transport-${quantity}` : null,
    farmer && quantity ? `/transport${qs}` : null
  );

  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [crop, setCrop] = useState(batch?.crop ?? "");
  const [qtyField, setQtyField] = useState(quantity || 500);
  const [date, setDate] = useState("");
  const [providerId, setProviderId] = useState<number | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !pickup || !destination || !crop || !date || !providerId) return;
    setSubmitting(true);
    try {
      const resp = await apiFetch<{ reference: string }>("/transport-requests", {
        method: "POST",
        token,
        body: { pickup, destination, crop, quantity_kg: qtyField, date, provider_id: providerId },
      });
      setReference(resp.reference);
    } catch {
      // keep form visible on failure
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell title={t("transport.title")} backHref="/">
      {loading && !data ? <p className="text-foreground/60">{t("common.loading")}</p> : null}
      {data && data.length === 0 ? <p className="text-foreground/70">{t("transport.noResults")}</p> : null}

      <div className="space-y-3">
        {data?.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setProviderId(p.id)}
            className={`w-full rounded-card bg-card p-4 text-left shadow-sm ring-2 ${
              providerId === p.id ? "ring-primary-600" : "ring-primary-700/10"
            }`}
          >
            <p className="text-base font-bold text-primary-700">{p.name}</p>
            <p className="text-sm text-foreground/70">{p.vehicle_type}</p>
            <p className="text-sm text-foreground/70">{t("transport.capacity", { cap: p.capacity_kg })}</p>
            {p.estimated_cost != null ? (
              <p className="mt-1 text-lg font-extrabold text-primary-700">
                {t("transport.estimatedCost")}: ₹{p.estimated_cost.toLocaleString("en-IN")}
              </p>
            ) : null}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <DataAge fetchedAt={fetchedAt} />
      </div>

      {providerId ? (
        <form onSubmit={submit} className="mt-6 rounded-card bg-card p-4 shadow-sm ring-1 ring-primary-700/10">
          <h2 className="mb-3 text-base font-bold text-primary-700">{t("transport.requestTitle")}</h2>

          {reference ? (
            <p className="rounded-btn bg-primary-600/10 p-3 text-base font-bold text-primary-700">
              {t("transport.referencePrefix")}: {reference}
            </p>
          ) : (
            <div className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-foreground/70">
                  {t("transport.pickupLabel")}
                </span>
                <input
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  className="min-h-[56px] w-full rounded-btn border border-primary-700/20 bg-surface px-4 text-base"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-foreground/70">
                  {t("transport.destinationLabel")}
                </span>
                <input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="min-h-[56px] w-full rounded-btn border border-primary-700/20 bg-surface px-4 text-base"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-foreground/70">
                  {t("transport.cropLabel")}
                </span>
                <input
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className="min-h-[56px] w-full rounded-btn border border-primary-700/20 bg-surface px-4 text-base"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-foreground/70">
                  {t("transport.quantityLabel")}
                </span>
                <input
                  type="number"
                  value={qtyField}
                  onChange={(e) => setQtyField(Number(e.target.value) || 0)}
                  className="min-h-[56px] w-full rounded-btn border border-primary-700/20 bg-surface px-4 text-base"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-foreground/70">
                  {t("transport.dateLabel")}
                </span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="min-h-[56px] w-full rounded-btn border border-primary-700/20 bg-surface px-4 text-base"
                />
              </label>
              <button
                type="submit"
                disabled={submitting}
                className="min-h-[56px] w-full rounded-btn bg-primary-700 text-base font-bold text-white disabled:opacity-60"
              >
                {t("transport.submit")}
              </button>
            </div>
          )}
        </form>
      ) : null}
    </AppShell>
  );
}
