import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AvailabilityBar } from '@/components/AvailabilityBar';
import { EmptyState } from '@/components/EmptyState';
import { ScreenHeader } from '@/components/ScreenHeader';
import { getColdStorage } from '@/lib/api/endpoints';
import { useLocationStore } from '@/stores/locationStore';

export default function FacilityDetailScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { id, lat: latParam, lng: lngParam } = useLocalSearchParams<{
    id: string;
    lat?: string;
    lng?: string;
  }>();
  const [booked, setBooked] = useState(false);
  const liveLocation = useLocationStore();
  // Normally forwarded by the list screen (already resolved there); this fallback only
  // matters for a direct deep link straight to a facility, bypassing the list screen.
  const lat = latParam ? Number(latParam) : liveLocation.lat;
  const lng = lngParam ? Number(lngParam) : liveLocation.lng;

  // Same query key as the Cold Storage list screen — reads its cache, no new request.
  const query = useQuery({
    queryKey: ['coldStorage', lat, lng],
    queryFn: () => getColdStorage(lat, lng),
  });
  const facility = query.data?.find((f) => f.id === id);

  const onBook = () => {
    Alert.alert(t('storage.confirmTitle'), t('storage.confirmBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.ok'), onPress: () => setBooked(true) },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-app" edges={['top']}>
      <ScreenHeader title={facility?.name ?? t('common.loading')} onBack={() => router.back()} />

      {!facility ? (
        <EmptyState icon="❄️" title={t('history.emptyTitle')} body={t('treatment.offlineNotCached')} />
      ) : (
        <View className="gap-4 px-4">
          <View className="gap-3 rounded-2xl border border-border bg-surface shadow-sm p-4">
            <AvailabilityBar
              availableTonnes={facility.availableTonnes}
              capacityTonnes={facility.capacityTonnes}
              label={t('storage.freeOfCapacity', { available: facility.availableTonnes, capacity: facility.capacityTonnes })}
            />
            <Row label={t('common.distanceAway', { distance: facility.distanceKm })} />
            <Row label={t('storage.perQuintalPerDay', { cost: facility.costPerDayRupeesPerQuintal })} />
          </View>

          {booked ? (
            <View className="items-center gap-2 rounded-2xl bg-state-success-bg p-6">
              <Text className="text-3xl">✅</Text>
              <Text className="text-center font-sans-bold text-base text-state-success">
                {t('storage.confirmed')}
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              className="min-h-[52px] items-center justify-center rounded-full bg-brand-primary"
              onPress={onBook}
              accessibilityRole="button"
            >
              <Text className="font-sans-bold text-base text-white">{t('storage.checkAvailability')}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

function Row({ label }: { label: string }) {
  return <Text className="text-sm text-ink-secondary">{label}</Text>;
}
