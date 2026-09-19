"use client";

import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n";

function humanize(iso: string, t: (key: string, vars?: Record<string, string | number>) => string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return t("common.justNow");
  if (minutes < 60) return t("common.minAgo", { n: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("common.hrAgo", { n: hours });
  return t("common.daysAgo", { n: Math.floor(hours / 24) });
}

export default function DataAge({ fetchedAt }: { fetchedAt: string | null }) {
  const { t } = useT();
  const [, tick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 30000);
    return () => clearInterval(id);
  }, []);

  if (!fetchedAt) return null;

  return <p className="text-xs text-foreground/60">{t("home.updated", { time: humanize(fetchedAt, t) })}</p>;
}
