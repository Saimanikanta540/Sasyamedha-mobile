"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n";
import { formatINR, formatSignedINR } from "@/lib/format";
import type { SellSmartResult } from "@/lib/types";

const DEST_ICON: Record<string, string> = { fpo: "🤝", buyer: "🧑‍💼", mandi: "🏛️" };

export default function DestinationCard({ result }: { result: SellSmartResult }) {
  const { t, lang } = useT();
  const [open, setOpen] = useState(false);
  const isBest = result.rank === 1;
  const name = lang === "te" || lang === "hi" ? result.name_local : result.name;

  return (
    <div
      className={`rounded-card bg-card p-4 shadow-sm ring-1 ${
        isBest ? "ring-2 ring-primary-600" : "ring-primary-700/10"
      }`}
    >
      {isBest ? (
        <span className="mb-2 inline-block rounded-full bg-primary-600 px-3 py-1 text-xs font-bold text-white">
          {t("sell.bestForYou")}
        </span>
      ) : null}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-base font-bold text-primary-700">
            <span aria-hidden>{DEST_ICON[result.destination_type] ?? "📍"}</span> {name}
          </p>
          <p className="text-sm text-foreground/70">{result.distance_km} {t("common.km")}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-extrabold text-primary-700">{formatINR(result.net_return)}</p>
          <p
            className={`text-sm font-semibold ${
              result.delta_vs_best < 0 ? "text-danger" : "text-primary-600"
            }`}
          >
            {formatSignedINR(result.delta_vs_best)}
          </p>
        </div>
      </div>
      <p className="mt-2 text-sm text-foreground/70">
        {t("sell.pricePerKg", { price: result.price_per_kg.toFixed(2) })}
      </p>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-2 min-h-[44px] text-sm font-semibold text-primary-600 underline"
      >
        {open ? t("sell.hideBreakdown") : t("sell.breakdown")}
      </button>

      {open ? (
        <ul className="mt-2 space-y-1 rounded-btn bg-surface p-3 text-sm">
          {result.breakdown.map((b, i) => (
            <li key={i} className="flex justify-between gap-3">
              <span className="text-foreground/70">{b.formula}</span>
              <span className="whitespace-nowrap font-semibold text-primary-700">
                {b.amount === 0 ? formatINR(0) : formatSignedINR(b.amount)}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <a
        href={`tel:${result.phone}`}
        className="mt-3 flex min-h-[56px] items-center justify-center rounded-btn bg-primary-700 text-base font-bold text-white"
      >
        {t("sell.call")}
      </a>
    </div>
  );
}
