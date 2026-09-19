"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { useT } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { apiUpload, ApiError } from "@/lib/api";
import { resizeImage } from "@/lib/image";
import type { ScanResult } from "@/lib/types";

export default function ScanPage() {
  const { t } = useT();
  const { token } = useAuth();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const resized = await resizeImage(file);
      const form = new FormData();
      form.append("file", resized, "leaf.jpg");
      const result = await apiUpload<ScanResult>("/disease/predict", form, token);
      window.sessionStorage.setItem("sasyamedha_last_scan", JSON.stringify(result));
      router.push("/scan/result");
    } catch (err) {
      setError(err instanceof ApiError && err.status === 0 ? t("errors.network") : t("errors.generic"));
      setBusy(false);
    }
  }

  return (
    <AppShell title={t("scan.title")} backHref="/">
      <div className="flex flex-col items-center">
        <div className="mb-6 flex h-56 w-full max-w-xs items-center justify-center rounded-card border-4 border-dashed border-primary-400 bg-card text-6xl">
          🍅
        </div>

        <ul className="mb-8 w-full space-y-3 text-base text-foreground/80">
          <li className="flex items-center gap-3">
            <span aria-hidden className="text-xl">
              🖼️
            </span>
            {t("scan.hintFill")}
          </li>
          <li className="flex items-center gap-3">
            <span aria-hidden className="text-xl">
              ☀️
            </span>
            {t("scan.hintDaylight")}
          </li>
          <li className="flex items-center gap-3">
            <span aria-hidden className="text-xl">
              🎯
            </span>
            {t("scan.hintPlain")}
          </li>
        </ul>

        {error ? <p className="mb-4 text-sm font-semibold text-danger">{error}</p> : null}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onFile}
          className="hidden"
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="flex min-h-[56px] w-full max-w-xs items-center justify-center rounded-btn bg-primary-700 text-base font-bold text-white disabled:opacity-60"
        >
          {busy ? t("scan.uploading") : t("scan.capture")}
        </button>
      </div>
    </AppShell>
  );
}
