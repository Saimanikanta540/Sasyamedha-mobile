"use client";

import { useOnline } from "@/lib/api";
import { useT } from "@/lib/i18n";

export default function OfflineBanner() {
  const online = useOnline();
  const { t } = useT();

  if (online) return null;

  return (
    <div className="bg-danger/10 border-b border-danger/30 px-4 py-2 text-sm font-semibold text-danger flex items-center gap-2">
      <span className="inline-block h-2.5 w-2.5 rounded-full bg-danger" aria-hidden />
      {t("offline.banner")}
    </div>
  );
}
