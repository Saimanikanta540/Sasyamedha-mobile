"use client";

import { useAuth } from "@/lib/auth";
import { useT, type Lang } from "@/lib/i18n";
import { apiFetch } from "@/lib/api";

const LANGS: Lang[] = ["te", "en", "hi"];

export default function LangSwitch() {
  const { t, lang, setLang } = useT();
  const { token, farmer, updateFarmer } = useAuth();

  function choose(next: Lang) {
    setLang(next);
    if (token && farmer && farmer.language !== next) {
      updateFarmer({ ...farmer, language: next });
      apiFetch(`/me`, { method: "PATCH", body: { language: next }, token }).catch(() => {
        // best-effort sync; UI already switched
      });
    }
  }

  return (
    <select
      aria-label={t("common.languageSwitchLabel")}
      value={lang}
      onChange={(e) => choose(e.target.value as Lang)}
      className="min-h-[44px] rounded-btn border border-primary-400/40 bg-card px-2 text-sm font-semibold text-primary-700"
    >
      {LANGS.map((l) => (
        <option key={l} value={l}>
          {t(`language.${l}`)}
        </option>
      ))}
    </select>
  );
}
