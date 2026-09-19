import {
  NotoSansDevanagari_400Regular,
  NotoSansDevanagari_700Bold,
} from '@expo-google-fonts/noto-sans-devanagari';
import {
  NotoSansTelugu_400Regular,
  NotoSansTelugu_700Bold,
} from '@expo-google-fonts/noto-sans-telugu';
import { NotoSans_400Regular, NotoSans_500Medium, NotoSans_700Bold, useFonts } from '@expo-google-fonts/noto-sans';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import '@/i18n';
import '@/global.css';
import { queryClient, queryPersister } from '@/lib/storage/query-client';
import { seedDemoScansIfEmpty } from '@/lib/storage/scan-history';
import { useLocationStore } from '@/stores/locationStore';
import { useOutboxSync } from '@/stores/outboxStore';
import { useScanHistoryStore } from '@/stores/scanHistoryStore';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  useOutboxSync();

  useEffect(() => {
    seedDemoScansIfEmpty().finally(() => useScanHistoryStore.getState().load());
    useLocationStore.getState().requestLocation();
  }, []);

  const [fontsLoaded] = useFonts({
    NotoSans_400Regular,
    NotoSans_500Medium,
    NotoSans_700Bold,
    NotoSansTelugu_400Regular,
    NotoSansTelugu_700Bold,
    NotoSansDevanagari_400Regular,
    NotoSansDevanagari_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  // Keep the native splash on screen rather than ever showing a blank frame.
  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ persister: queryPersister }}
        >
          <Stack screenOptions={{ headerShown: false }} />
        </PersistQueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
