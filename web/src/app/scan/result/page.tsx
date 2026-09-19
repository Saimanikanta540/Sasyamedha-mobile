"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import ConfidenceBar from "@/components/ConfidenceBar";
import SpeakButton from "@/components/SpeakButton";
import { useT } from "@/lib/i18n";
import type { ScanResult } from "@/lib/types";

export default function ScanResultPage() {
  const { t } = useT();
  const router = useRouter();
  const [result, setResult] = useState<ScanResult | null | undefined>(undefined);

  useEffect(() => {
    const raw = window.sessionStorage.getItem("sasyamedha_last_scan");
    if (!raw) {
      setResult(null);
      return;
    }
    setResult(JSON.parse(raw) as ScanResult);
  }, []);

  if (result === undefined) return null;
  if (result === null) {
    router.replace("/scan");
    return null;
  }

  const speechText = `${result.label}. ${t(
    result.band === "high"
      ? "scanResult.confidenceHigh"
      : result.band === "medium"
        ? "scanResult.confidenceMedium"
        : "scanResult.confidenceLow"
  )}.`;

  if (result.band === "low") {
    return (
      <AppShell title={t("scanResult.title")} backHref="/scan">
        <div className="rounded-card bg-danger/10 p-4 ring-1 ring-danger/30">
          <p className="mb-2 text-base font-bold text-danger">{t("scanResult.caution")}</p>
          <p className="text-lg font-extrabold text-foreground">{result.label}</p>
          <div className="mt-3">
            <ConfidenceBar confidence={result.confidence} band={result.band} />
          </div>
        </div>

        {result.is_mock ? (
          <span className="mt-3 inline-block rounded-full bg-foreground/10 px-3 py-1 text-xs font-semibold text-foreground/70">
            {t("scanResult.mockChip")}
          </span>
        ) : null}

        <div className="mt-3">
          <SpeakButton text={speechText} />
        </div>

        <Link
          href="/scan"
          className="mt-6 flex min-h-[56px] items-center justify-center rounded-btn bg-primary-700 text-base font-bold text-white"
        >
          {t("scanResult.retake")}
        </Link>
        <a
          href="tel:9848000101"
          className="mt-3 flex min-h-[56px] items-center justify-center rounded-btn border border-primary-700 text-base font-bold text-primary-700"
        >
          {t("scanResult.askExpert")}
        </a>
      </AppShell>
    );
  }

  return (
    <AppShell title={t("scanResult.title")} backHref="/scan">
      <div className="rounded-card bg-card p-4 shadow-sm ring-1 ring-primary-700/10">
        <p className="text-xl font-extrabold text-primary-700">{result.label}</p>
        <div className="mt-3">
          <ConfidenceBar confidence={result.confidence} band={result.band} />
        </div>
        {result.band === "medium" ? (
          <p className="mt-2 text-sm font-semibold text-accent">{t("scanResult.clearerPhoto")}</p>
        ) : null}
      </div>

      {result.is_mock ? (
        <span className="mt-3 inline-block rounded-full bg-foreground/10 px-3 py-1 text-xs font-semibold text-foreground/70">
          {t("scanResult.mockChip")}
        </span>
      ) : null}

      <div className="mt-3">
        <SpeakButton text={speechText} />
      </div>

      <Link
        href={`/treatment/${result.class_key}`}
        className="mt-6 flex min-h-[56px] items-center justify-center rounded-btn bg-primary-700 text-base font-bold text-white"
      >
        {t("scanResult.viewTreatment")}
      </Link>
      <Link
        href="/scan"
        className="mt-3 flex min-h-[56px] items-center justify-center rounded-btn border border-primary-700 text-base font-bold text-primary-700"
      >
        {t("scanResult.retake")}
      </Link>
    </AppShell>
  );
}
