import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY, SupportedLanguage } from '@/i18n';

/**
 * Reads the persisted language on mount and exposes a setter that updates
 * i18next (triggering an immediate re-render of every mounted screen via
 * useTranslation) and persists the choice for next launch.
 */
export function useLanguage() {
  const { i18n } = useTranslation();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(LANGUAGE_STORAGE_KEY).then((stored) => {
      if (cancelled) return;
      if (stored && stored !== i18n.language) {
        i18n.changeLanguage(stored);
      }
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
    // Only run once on mount — i18n.language changes are driven by setLanguage below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLanguage = useCallback(
    (lang: SupportedLanguage) => {
      i18n.changeLanguage(lang);
      AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    },
    [i18n],
  );

  return {
    language: (i18n.language as SupportedLanguage) ?? DEFAULT_LANGUAGE,
    setLanguage,
    ready,
  };
}
