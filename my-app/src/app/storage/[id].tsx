import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AvailabilityBar } from '@/components/AvailabilityBar';
import { EmptyState } from '@/components/EmptyState';
import { getColdStorage } from '@/lib/api/endpoints';

export default function FacilityDetailScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { id, lat: latParam, lng: lngParam } = useLocalSearchParams<{
    id: string;
    lat?: string;
    lng?: string;
  }>();
  const [booked, setBooked] = useState(false);
  const lat = latParam ? Number(latParam) : undefined;
  const lng = lngParam ? Number(lngParam) : undefined;

  // Same query key as the Cold Storage list screen — reads its cache, no new request.
  const query = useQuery({
    queryKey: ['coldStorage', lat, lng],
    queryFn: () => getColdStorage(lat, lng),
  });
  const facility = query.data?.find((f) => f.id === id);

  const onBook = () => {
    Alert.alert('Check availability', 'Confirm this facility for your harvest?', [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.ok'), onPress: () => setBooked(true) },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-app" edges={['top']}>
      <View className="flex-row items-center gap-3 px-4 py-4">
        <TouchableOpacity
          className="h-10 w-10 items-center justify-center rounded-full bg-surface-muted"
          onPress={() => router.back()}
          accessibilityRole="button"
        >
          <Text className="text-xl text-ink-primary">←</Text>
        </TouchableOpacity>
        <Text className="font-sans-bold text-lg text-ink-primary" numberOfLines={1}>
          {facility?.name ?? t('common.loading')}
        </Text>
      </View>

      {!facility ? (
        <EmptyState icon="❄️" title={t('history.emptyTitle')} body={t('treatment.offlineNotCached')} />
      ) : (
        <View className="gap-4 px-4">
          <View className="gap-3 rounded-2xl border border-border bg-surface p-4">
            <AvailabilityBar
              availableTonnes={facility.availableTonnes}
              capacityTonnes={facility.capacityTonnes}
              label={`${facility.availableTonnes}t free of ${facility.capacityTonnes}t capacity`}
            />
            <Row label={t('common.distanceAway', { distance: facility.distanceKm })} />
            <Row label={`₹${facility.costPerDayRupeesPerQuintal} / quintal / day`} />
          </View>

          {booked ? (
            <View className="items-center gap-2 rounded-2xl bg-state-success-bg p-6">
              <Text className="text-3xl">✅</Text>
              <Text className="text-center font-sans-bold text-base text-state-success">
                Availability confirmed — the facility will hold space for your harvest.
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              className="min-h-[52px] items-center justify-center rounded-full bg-brand-primary"
              onPress={onBook}
              accessibilityRole="button"
            >
              <Text className="font-sans-bold text-base text-white">Check availability / Book</Text>
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
