import * as Location from 'expo-location';

import type { SupportedLanguage } from '@/i18n';

const TELUGU_STATES = ['andhra pradesh', 'telangana'];
const HINDI_BELT_STATES = [
  'uttar pradesh',
  'madhya pradesh',
  'bihar',
  'rajasthan',
  'haryana',
  'delhi',
  'nct of delhi',
  'uttarakhand',
  'himachal pradesh',
  'jharkhand',
  'chhattisgarh',
  'punjab',
];

function languageForRegion(region: string | null | undefined): SupportedLanguage | null {
  if (!region) return null;
  const normalized = region.toLowerCase();
  if (TELUGU_STATES.some((s) => normalized.includes(s))) return 'te';
  if (HINDI_BELT_STATES.some((s) => normalized.includes(s))) return 'hi';
  return 'en';
}

/**
 * Best-effort only: resolves to null on denied permission, disabled location services,
 * an unrecognized region, or any failure along the way. Callers must always have their
 * own fallback (a default language) — this never blocks and never throws.
 */
export async function detectLanguageFromLocation(): Promise<SupportedLanguage | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;

    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) return null;

    const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
    const [place] = await Location.reverseGeocodeAsync({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    });
    return languageForRegion(place?.region);
  } catch {
    return null;
  }
}
