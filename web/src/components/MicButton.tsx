"use client";

import { useEffect, useRef, useState } from "react";
import { canListen, startListening } from "@/lib/listen";
import { useT } from "@/lib/i18n";

export default function MicButton({ onResult }: { onResult: (text: string) => void }) {
  const { lang } = useT();
  const [available, setAvailable] = useState(false);
  const [listening, setListening] = useState(false);
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    setAvailable(canListen());
  }, []);

  if (!available) return null;

  function toggle() {
    if (listening) {
      stopRef.current?.();
      setListening(false);
      return;
    }
    const stop = startListening(
      lang,
      (transcript) => onResult(transcript),
      () => setListening(false),
      () => setListening(false)
    );
    if (stop) {
      stopRef.current = stop;
      setListening(true);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={listening}
      className={`flex min-h-[56px] min-w-[56px] items-center justify-center rounded-btn text-xl ${
        listening ? "animate-pulse bg-danger text-white" : "bg-primary-700 text-white"
      }`}
    >
      <span aria-hidden>{listening ? "⏹" : "🎤"}</span>
    </button>
  );
}
