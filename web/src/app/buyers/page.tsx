"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import DataAge from "@/components/DataAge";
import { useT } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useApi } from "@/lib/api";
import type { BuyerItem, FpoItem } from "@/lib/types";

const RADIUS_KM = 200;

export default function BuyersPage() {
  const { t } = useT();
  const { farmer } = useAuth();
  const [tab, setTab] = useState<"buyers" | "fpos">("buyers");

  const qs = farmer ? `?lat=${farmer.lat}&lng=${farmer.lng}&radius_km=${RADIUS_KM}` : "";

  const { data: buyers, fetchedAt: buyersAt } = useApi<BuyerItem[]>(
    farmer ? "buyers" : null,
    farmer ? `/buyers${qs}` : null
  );
  const { data: fpos, fetchedAt: fposAt } = useApi<FpoItem[]>(
    farmer ? "fpos" : null,
    farmer ? `/fpos${qs}` : null
  );

  const list = tab === "buyers" ? buyers : fpos;
  const fetchedAt = tab === "buyers" ? buyersAt : fposAt;

  return (
    <AppShell title={t("buyers.title")} backHref="/">
      <div className="mb-4 flex rounded-btn bg-card p-1 ring-1 ring-primary-700/10">
        <button
          type="button"
          onClick={() => setTab("buyers")}
          className={`min-h-[44px] flex-1 rounded-btn text-sm font-bold ${
            tab === "buyers" ? "bg-primary-700 text-white" : "text-primary-700"
          }`}
        >
          {t("buyers.tabBuyers")}
        </button>
        <button
          type="button"
          onClick={() => setTab("fpos")}
          className={`min-h-[44px] flex-1 rounded-btn text-sm font-bold ${
            tab === "fpos" ? "bg-primary-700 text-white" : "text-primary-700"
          }`}
        >
          {t("buyers.tabFpos")}
        </button>
      </div>

      {list && list.length === 0 ? <p className="text-foreground/70">{t("buyers.noResults")}</p> : null}

      <div className="space-y-3">
        {list?.map((item) => (
          <div key={item.id} className="rounded-card bg-card p-4 shadow-sm ring-1 ring-primary-700/10">
            <div className="flex items-start justify-between gap-2">
              <p className="text-base font-bold text-primary-700">{item.name}</p>
              {item.verified ? (
                <span className="whitespace-nowrap rounded-full bg-primary-600/10 px-2 py-1 text-xs font-semibold text-primary-600">
                  {t("buyers.verified")}
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-foreground/70">
              {t("buyers.cropsSought")}: {item.crops.map((c) => c[0].toUpperCase() + c.slice(1)).join(", ")}
            </p>
            {"min_qty_kg" in item ? (
              <p className="text-sm text-foreground/70">
                {t("buyers.quantityWindow")}: {(item as BuyerItem).min_qty_kg ?? "—"}–
                {(item as BuyerItem).max_qty_kg ?? "—"} kg
              </p>
            ) : null}
            <p className="text-sm text-foreground/70">
              {t("buyers.indicativePrice")}: ₹{item.indicative_price_qtl.toLocaleString("en-IN")}/quintal
            </p>
            {item.distance_km != null ? (
              <p className="text-sm text-foreground/70">
                {item.distance_km} {t("common.km")}
              </p>
            ) : null}
            {item.pickup_offered ? (
              <p className="mt-1 text-sm font-semibold text-primary-600">{t("buyers.pickupOffered")}</p>
            ) : null}

            <a
              href={`tel:${item.phone}`}
              className="mt-3 flex min-h-[56px] items-center justify-center rounded-btn bg-primary-700 text-base font-bold text-white"
            >
              {t("common.call")}
            </a>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <DataAge fetchedAt={fetchedAt} />
      </div>
    </AppShell>
  );
}
