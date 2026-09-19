"use client";

import Link from "next/link";
import OfflineBanner from "./OfflineBanner";
import LangSwitch from "./LangSwitch";
import { useT } from "@/lib/i18n";

export default function AppShell({
  title,
  backHref,
  children,
}: {
  title?: string;
  backHref?: string;
  children: React.ReactNode;
}) {
  const { t } = useT();

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="sticky top-0 z-10 border-b border-primary-700/10 bg-card">
        <div className="mx-auto flex max-w-[560px] items-center gap-2 px-4 py-3">
          {backHref ? (
            <Link
              href={backHref}
              aria-label={t("common.back")}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-btn text-xl text-primary-700"
            >
              ←
            </Link>
          ) : null}
          <h1 className="flex-1 truncate text-lg font-bold text-primary-700">
            {title ?? t("common.appName")}
          </h1>
          <LangSwitch />
        </div>
      </header>
      <OfflineBanner />
      <main className="mx-auto w-full max-w-[560px] flex-1 px-4 pb-10 pt-4">{children}</main>
    </div>
  );
}
