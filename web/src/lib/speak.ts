import type { Lang } from "./i18n";

const VOICE_LOCALE: Record<Lang, string> = {
  te: "te-IN",
  en: "en-IN",
  hi: "hi-IN",
};

export function canSpeak(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function speak(text: string, lang: Lang): void {
  if (!canSpeak()) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = VOICE_LOCALE[lang];
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (!canSpeak()) return;
  window.speechSynthesis.cancel();
}

export function isSpeaking(): boolean {
  if (!canSpeak()) return false;
  return window.speechSynthesis.speaking;
}
