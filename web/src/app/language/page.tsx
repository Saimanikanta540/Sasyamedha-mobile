"use client";

import { useRouter } from "next/navigation";
import { useT, type Lang } from "@/lib/i18n";

const OPTIONS: Lang[] = ["te", "en", "hi"];

export default function LanguagePage() {
  const { t, setLang } = useT();
  const router = useRouter();

  function choose(lang: Lang) {
    setLang(lang);
    router.push("/onboarding");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 py-10">
      <div className="w-full max-w-[560px]">
        <h1 className="mb-1 text-center text-2xl font-extrabold text-primary-700">
          {t("language.title")}
        </h1>
        <p className="mb-8 text-center text-base text-foreground/70">{t("language.subtitle")}</p>
        <div className="flex flex-col gap-4">
          {OPTIONS.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => choose(lang)}
              className="min-h-[80px] rounded-card bg-card text-3xl font-bold text-primary-700 shadow-sm ring-1 ring-primary-700/10 active:scale-[0.99]"
            >
              {t(`language.${lang}`)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
