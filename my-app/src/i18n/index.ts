import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import hi from './locales/hi.json';
import te from './locales/te.json';

export const SUPPORTED_LANGUAGES = ['te', 'en', 'hi'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/** Telugu is the primary content language for this app, not a translation target. */
export const DEFAULT_LANGUAGE: SupportedLanguage = 'te';

export const LANGUAGE_STORAGE_KEY = 'scc.language';

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: {
      te: { translation: te },
      en: { translation: en },
      hi: { translation: hi },
    },
    lng: DEFAULT_LANGUAGE,
    // No silent fallback: a missing key must be visibly wrong, never quietly
    // rendered in English, so a gap gets caught before it ships.
    fallbackLng: false,
    returnEmptyString: false,
    interpolation: { escapeValue: false },
    parseMissingKeyHandler: (key) => `⛔ missing:${key}`,
  });
}

export default i18n;
