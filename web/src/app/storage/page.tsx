"use client";

import AppShell from "@/components/AppShell";
import DataAge from "@/components/DataAge";
import { useT } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useApi } from "@/lib/api";
import type { ColdStorageItem } from "@/lib/types";

export default function StoragePage() {
  const { t } = useT();
  const { farmer } = useAuth();

  const qs = farmer ? `?lat=${farmer.lat}&lng=${farmer.lng}&radius_km=100` : "";
  const { data, fetchedAt, loading } = useApi<ColdStorageItem[]>(
    farmer ? "cold-storages" : null,
    farmer ? `/cold-storages${qs}` : null
  );

  return (
    <AppShell title={t("storage.title")} backHref="/">
      {loading && !data ? <p className="text-foreground/60">{t("common.loading")}</p> : null}
      {data && data.length === 0 ? <p className="text-foreground/70">{t("storage.noResults")}</p> : null}

      <div className="space-y-3">
        {data?.map((s) => (
          <div key={s.id} className="rounded-card bg-card p-4 shadow-sm ring-1 ring-primary-700/10">
            <p className="text-base font-bold text-primary-700">{s.name}</p>
            <p className="text-sm text-foreground/70">
              {s.district}
              {s.distance_km != null ? ` · ${s.distance_km} ${t("common.km")}` : ""}
            </p>

            <div className="mt-2">
              <div className="h-3 w-full overflow-hidden rounded-full bg-primary-700/10">
                <div
                  className="h-full rounded-full bg-primary-600"
                  style={{ width: `${s.available_pct}%` }}
                />
              </div>
              <p className="mt-1 text-sm font-semibold text-primary-700">
                {t("storage.available", { pct: s.available_pct })}
              </p>
            </div>

            <p className="mt-2 text-sm text-foreground/70">
              {t("storage.costPerDay", { cost: s.cost_per_kg_per_day })}
            </p>

            <a
              href={`tel:${s.phone}`}
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
