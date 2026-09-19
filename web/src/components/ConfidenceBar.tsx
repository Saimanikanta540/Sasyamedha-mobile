"use client";

import { useT } from "@/lib/i18n";

const BAND_COLOR: Record<string, string> = {
  high: "bg-primary-600",
  medium: "bg-accent",
  low: "bg-danger",
};

const BAND_WORD_KEY: Record<string, string> = {
  high: "scanResult.confidenceHigh",
  medium: "scanResult.confidenceMedium",
  low: "scanResult.confidenceLow",
};

export default function ConfidenceBar({ confidence, band }: { confidence: number; band: string }) {
  const { t } = useT();
  const pct = Math.round(confidence * 100);

  return (
    <div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-primary-700/10">
        <div
          className={`h-full rounded-full ${BAND_COLOR[band] ?? "bg-primary-600"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1 text-base font-bold text-primary-700">
        {t(BAND_WORD_KEY[band] ?? "scanResult.confidenceMedium")} · {pct}%
      </p>
    </div>
  );
}
