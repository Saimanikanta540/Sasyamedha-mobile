"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import MicButton from "@/components/MicButton";
import { useT } from "@/lib/i18n";

const ROUTES: { keywords: string[]; href: string }[] = [
  { keywords: ["scan", "crop", "disease", "leaf", "పంట", "ఆకు", "फसल", "पत्ती"], href: "/scan" },
  { keywords: ["price", "market", "mandi", "ధర", "మార్కెట్", "भाव", "बाजार"], href: "/prices" },
  { keywords: ["sell", "అమ్మ", "बेच"], href: "/sell" },
  { keywords: ["storage", "cold", "నిల్వ", "भंडार"], href: "/storage" },
  { keywords: ["transport", "vehicle", "రవాణా", "వాహనం", "परिवहन", "वाहन"], href: "/transport" },
  { keywords: ["buyer", "fpo", "కొనుగోలు", "खरीदार"], href: "/buyers" },
];

export default function AssistantPage() {
  const { t } = useT();
  const router = useRouter();
  const [text, setText] = useState("");

  function go(spoken: string) {
    const lower = spoken.toLowerCase();
    const match = ROUTES.find((r) => r.keywords.some((k) => lower.includes(k.toLowerCase())));
    router.push(match?.href ?? "/");
  }

  function send(e: React.FormEvent) {
    e.preventDefault();
    go(text);
  }

  function onVoiceResult(transcript: string) {
    setText(transcript);
    go(transcript);
  }

  return (
    <AppShell title={t("assistant.title")} backHref="/">
      <form onSubmit={send} className="flex flex-col gap-3">
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("assistant.placeholder")}
            className="min-h-[56px] w-full flex-1 rounded-btn border border-primary-700/20 bg-card px-4 text-base"
          />
          <MicButton onResult={onVoiceResult} />
        </div>
        <button
          type="submit"
          className="min-h-[56px] rounded-btn bg-primary-700 text-base font-bold text-white"
        >
          {t("assistant.send")}
        </button>
      </form>
    </AppShell>
  );
}
