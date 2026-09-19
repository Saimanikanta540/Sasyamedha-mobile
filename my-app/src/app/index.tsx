import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLanguage } from '@/hooks/use-language';
import { LANGUAGE_STORAGE_KEY } from '@/i18n';
import { detectLanguageFromLocation } from '@/lib/location/detect-language';

const DETECTION_TIMEOUT_MS = 5000;

/**
 * The very first screen. A returning user (language already saved) passes through
 * instantly; a first launch detects the state via location services and picks
 * Telugu/Hindi/English accordingly, with a hard timeout so a stuck permission
 * prompt or disabled location service never leaves the user stranded here.
 */
export default function LaunchScreen() {
  const router = useRouter();
  const { setLanguage } = useLanguage();
  const [locating, setLocating] = useState(false);
  const navigated = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const goHome = () => {
      if (navigated.current || cancelled) return;
      navigated.current = true;
      router.replace('/home');
    };

    (async () => {
      const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored || cancelled) {
        goHome();
        return;
      }

      setLocating(true);
      const timeout = new Promise<null>((resolve) => {
        setTimeout(() => resolve(null), DETECTION_TIMEOUT_MS);
      });
      const detected = await Promise.race([detectLanguageFromLocation(), timeout]);
      if (cancelled) return;
      if (detected) setLanguage(detected);
      goHome();
    })();

    return () => {
      cancelled = true;
    };
    // Cold-start only — never re-runs while this screen is mounted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView className="flex-1 items-center justify-center gap-6 bg-brand-primary px-8">
      <View className="items-center gap-2">
        <Text className="font-sans-bold text-3xl text-white">Sasyamedha</Text>
        <Text className="text-base text-white/70">నమస్తే · नमस्ते · Namaste</Text>
      </View>
      <ActivityIndicator size="large" color="#ffffff" />
      {locating && (
        <Text className="text-center text-sm text-white/60">Detecting your location…</Text>
      )}
    </SafeAreaView>
  );
}
