"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import Tile from "@/components/Tile";
import DataAge from "@/components/DataAge";
import { useAuth } from "@/lib/auth";
import { useT } from "@/lib/i18n";
import { useApi, useOnline } from "@/lib/api";
import type { Batch } from "@/lib/types";

export default function HomePage() {
  const { ready, farmer } = useAuth();
  const { t } = useT();
  const router = useRouter();
  const online = useOnline();

  useEffect(() => {
    if (ready && !farmer) router.replace("/language");
  }, [ready, farmer, router]);

  const { data: batches, fetchedAt } = useApi<Batch[]>(
    farmer ? "batches" : null,
    farmer ? "/batches" : null,
    { auth: true }
  );

  if (!ready || !farmer) {
    return (
      <div className="flex min-h-screen items-center justify-center text-foreground/60">
        {t("common.loading")}
      </div>
    );
  }

  const batch = batches?.[0];

  return (
    <AppShell>
      <p className="mb-4 text-lg font-semibold text-foreground/80">
        {t("home.greeting", { name: farmer.name })}
      </p>

      <section className="mb-6 rounded-card bg-card p-4 shadow-sm ring-1 ring-primary-700/10">
        <p className="mb-1 text-sm font-semibold text-foreground/60">{t("home.batchTitle")}</p>
        {batch ? (
          <p className="text-xl font-extrabold text-primary-700">
            {batch.crop[0].toUpperCase() + batch.crop.slice(1)} ·{" "}
            {t("home.batchQuantity", { qty: batch.quantity_kg })} · {farmer.district}
          </p>
        ) : (
          <div>
            <p className="mb-3 text-base text-foreground/70">{t("home.batchEmpty")}</p>
            <Link
              href="/sell"
              className="inline-flex min-h-[44px] items-center rounded-btn bg-primary-700 px-4 text-sm font-bold text-white"
            >
              {t("home.batchCreate")}
            </Link>
          </div>
        )}
      </section>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Tile href="/scan" icon="📷" label={t("home.tileScan")} />
        <Tile href="/prices" icon="📈" label={t("home.tileMarket")} />
        <Tile href="/sell" icon="💰" label={t("home.tileSell")} />
        <Tile href="/storage" icon="🧊" label={t("home.tileStorage")} />
        <Tile href="/transport" icon="🚚" label={t("home.tileTransport")} />
        <Tile href="/assistant" icon="💬" label={t("home.tileAssistant")} />
      </div>

      <div className="mt-6 flex items-center gap-2">
        <span
          className={`inline-block h-2.5 w-2.5 rounded-full ${online ? "bg-primary-600" : "bg-danger"}`}
          aria-hidden
        />
        <span className="text-xs text-foreground/60">{online ? t("home.online") : t("home.offline")}</span>
        <DataAge fetchedAt={fetchedAt} />
      </div>
    </AppShell>
  );
}
