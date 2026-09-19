"use client";

import { useEffect, useState } from "react";
import { canSpeak, isSpeaking, speak, stopSpeaking } from "@/lib/speak";
import { useT } from "@/lib/i18n";

export default function SpeakButton({ text }: { text: string }) {
  const { t, lang } = useT();
  const [speakable, setSpeakable] = useState(false);
  const [speakingNow, setSpeakingNow] = useState(false);

  useEffect(() => {
    setSpeakable(canSpeak());
  }, []);

  useEffect(() => {
    if (!speakable) return;
    const id = setInterval(() => setSpeakingNow(isSpeaking()), 400);
    return () => clearInterval(id);
  }, [speakable]);

  if (!speakable) return null;

  function toggle() {
    if (speakingNow) {
      stopSpeaking();
      setSpeakingNow(false);
    } else {
      speak(text, lang);
      setSpeakingNow(true);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex min-h-[44px] items-center gap-2 rounded-btn border border-primary-400/40 bg-card px-3 text-sm font-semibold text-primary-700"
    >
      <span aria-hidden>{speakingNow ? "⏹" : "🔊"}</span>
      {speakingNow ? t("common.stop") : t("common.speak")}
    </button>
  );
}
