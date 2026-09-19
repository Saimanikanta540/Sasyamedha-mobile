import * as Speech from 'expo-speech';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { SupportedLanguage } from '@/i18n';

const SPEECH_LOCALE: Record<SupportedLanguage, string> = {
  te: 'te-IN',
  en: 'en-IN',
  hi: 'hi-IN',
};

/**
 * Text-to-speech is a primary interaction path here, not an accessibility
 * bolt-on (brief §5.4) — every result screen wires this to a speaker icon
 * that shows a visible stop control while playing.
 */
export function useSpeak() {
  const { i18n } = useTranslation();
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  const speak = useCallback(
    (text: string) => {
      Speech.stop();
      setIsSpeaking(true);
      Speech.speak(text, {
        language: SPEECH_LOCALE[(i18n.language as SupportedLanguage) ?? 'te'],
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    },
    [i18n.language],
  );

  const stop = useCallback(() => {
    Speech.stop();
    setIsSpeaking(false);
  }, []);

  return { speak, stop, isSpeaking };
}
