import type { Lang } from "./i18n";

const RECOGNITION_LOCALE: Record<Lang, string> = {
  te: "te-IN",
  en: "en-IN",
  hi: "hi-IN",
};

type SpeechRecognitionCtor = new () => SpeechRecognition;

function getCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function canListen(): boolean {
  return getCtor() !== null;
}

/** Starts one listening session. Calls onResult with the final transcript, then onEnd. */
export function startListening(
  lang: Lang,
  onResult: (transcript: string) => void,
  onEnd: () => void,
  onError?: () => void
): (() => void) | null {
  const Ctor = getCtor();
  if (!Ctor) return null;

  const recognition = new Ctor();
  recognition.lang = RECOGNITION_LOCALE[lang];
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    const transcript = event.results[event.results.length - 1][0].transcript;
    onResult(transcript.trim());
  };
  recognition.onerror = () => {
    onError?.();
  };
  recognition.onend = () => {
    onEnd();
  };

  recognition.start();
  return () => recognition.stop();
}
