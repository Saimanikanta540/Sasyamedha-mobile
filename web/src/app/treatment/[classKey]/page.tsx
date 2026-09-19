"use client";

import { use } from "react";
import AppShell from "@/components/AppShell";
import SpeakButton from "@/components/SpeakButton";
import { useT } from "@/lib/i18n";
import { useApi } from "@/lib/api";
import type { TreatmentRead } from "@/lib/types";

export default function TreatmentPage({ params }: { params: Promise<{ classKey: string }> }) {
  const { classKey } = use(params);
  const { t, lang } = useT();

  const { data, loading, error } = useApi<TreatmentRead>(
    `treatment-${classKey}-${lang}`,
    `/treatments/${classKey}?lang=${lang}`
  );

  return (
    <AppShell title={t("treatment.title")} backHref="/scan/result">
      {loading && !data ? <p className="text-foreground/60">{t("common.loading")}</p> : null}
      {error && !data ? <p className="text-sm font-semibold text-danger">{t("treatment.notAvailable")}</p> : null}

      {data ? (
        <div>
          <div className="mb-4 flex items-start justify-between gap-3">
            <h2 className="text-xl font-extrabold text-primary-700">{data.display_name}</h2>
            <SpeakButton
              text={[
                data.display_name,
                t("treatment.symptoms"),
                ...data.symptoms,
                t("treatment.actions"),
                ...data.immediate_actions,
                t("treatment.prevention"),
                ...data.prevention,
                data.indicative_cost_note,
                data.disclaimer,
              ].join(". ")}
            />
          </div>

          <section className="mb-5">
            <h3 className="mb-2 text-base font-bold text-primary-700">{t("treatment.symptoms")}</h3>
            <ul className="list-disc space-y-1 pl-5 text-base text-foreground/85">
              {data.symptoms.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </section>

          <section className="mb-5">
            <h3 className="mb-2 text-base font-bold text-primary-700">{t("treatment.actions")}</h3>
            <ol className="list-decimal space-y-2 pl-5 text-base text-foreground/85">
              {data.immediate_actions.map((a, i) => (
                <li key={i} className="line-clamp-3">
                  {a}
                </li>
              ))}
            </ol>
          </section>

          <section className="mb-5">
            <h3 className="mb-2 text-base font-bold text-primary-700">{t("treatment.prevention")}</h3>
            <ul className="list-disc space-y-1 pl-5 text-base text-foreground/85">
              {data.prevention.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </section>

          <section className="mb-5 rounded-card bg-card p-3 ring-1 ring-primary-700/10">
            <h3 className="mb-1 text-sm font-bold text-primary-700">{t("treatment.cost")}</h3>
            <p className="text-base text-foreground/85">{data.indicative_cost_note}</p>
          </section>

          <section className="rounded-card bg-accent/10 p-3 ring-1 ring-accent/40">
            <h3 className="mb-1 text-sm font-bold text-accent">{t("treatment.disclaimer")}</h3>
            <p className="text-sm text-foreground/85">{data.disclaimer}</p>
          </section>
        </div>
      ) : null}
    </AppShell>
  );
}
