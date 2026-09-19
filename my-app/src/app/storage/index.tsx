import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AvailabilityBar } from '@/components/AvailabilityBar';
import { EmptyState } from '@/components/EmptyState';
import { ScreenHeader } from '@/components/ScreenHeader';
import { StaleBadge } from '@/components/StaleBadge';
import { TileGridMap } from '@/components/TileGridMap';
import { getColdStorage } from '@/lib/api/endpoints';
import { useIsOnline } from '@/lib/network/connectivity';
import { useLocationStore } from '@/stores/locationStore';
import { useSessionStore } from '@/stores/sessionStore';

const DEFAULT_CENTER = { lat: 16.4422073, lng: 80.6253234 }; // KL University, Vaddeswaram
const RADIUS_STEPS = [10, 25, 50, Infinity];

export default function ColdStorageScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const isOnline = useIsOnline();
  const params = useLocalSearchParams<{ destinationLat?: string; destinationLng?: string; commodity?: string }>();
  const { width: screenWidth } = useWindowDimensions();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [radiusStep, setRadiusStep] = useState(0);

  const liveLocation = useLocationStore();
  const sessionCommodity = useSessionStore((s) => s.commodity);
  // A destination chosen on the Sell Smart screen wins (storage near *that* buyer/mandi);
  // otherwise fall back to the device's live location so this screen works standalone too.
  const lat = params.destinationLat ? Number(params.destinationLat) : liveLocation.lat;
  const lng = params.destinationLng ? Number(params.destinationLng) : liveLocation.lng;
  // Same fallback chain: whatever crop destination/[id].tsx forwarded (it already sends
  // this — storage/index.tsx just never read it before), else the crop from the last
  // Sell Smart run in this session, else no filter (show every facility).
  const commodity = params.commodity || sessionCommodity || undefined;

  const query = useQuery({
    queryKey: ['coldStorage', lat, lng, commodity],
    queryFn: () => getColdStorage(lat, lng, commodity),
  });

  const isOffline = query.fetchStatus === 'paused';
  const radiusKm = RADIUS_STEPS[radiusStep];
  const facilities = (query.data ?? []).filter((f) => f.distanceKm <= radiusKm);

  const defaultCenter = lat != null && lng != null ? { lat, lng } : DEFAULT_CENTER;
  const selectedFacility = query.data?.find((f) => f.id === selectedId);
  // A controlled prop, not an imperative "pan to" call — selecting a facility just
  // re-centers the map by re-rendering with new coordinates, fetching a fresh small
  // set of tile images. Simpler and easier to reason about than an animated pan.
  const mapCenter = selectedFacility ? { lat: selectedFacility.lat, lng: selectedFacility.lng } : defaultCenter;

  const focusFacility = (facilityId: string) => {
    setSelectedId(facilityId);
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-app" edges={['top']}>
      <ScreenHeader title={t('home.tileStore')} subtitle={t('home.tileStoreSub')} onBack={() => router.back()} />

      <View className="mx-4 mb-3 overflow-hidden rounded-3xl shadow-md" style={{ elevation: 3, height: 200 }}>
        <TileGridMap
          center={mapCenter}
          width={screenWidth - 32}
          height={200}
          markers={(query.data ?? []).map((facility) => ({
            id: facility.id,
            lat: facility.lat,
            lng: facility.lng,
            selected: selectedId === facility.id,
          }))}
          onMarkerPress={focusFacility}
        />
      </View>

      {isOffline && query.data && (
        <View className="px-4 pt-2">
          <StaleBadge label={t('connectivity.offlineBadge')} />
        </View>
      )}

      {query.isLoading ? (
        <View className="gap-3 px-4 pt-3">
          {[0, 1].map((i) => (
            <View key={i} className="h-24 rounded-2xl border border-border bg-surface shadow-sm p-4">
              <View className="h-3 w-1/2 rounded bg-surface-muted" />
            </View>
          ))}
        </View>
      ) : facilities.length === 0 ? (
        <EmptyState
          icon="❄️"
          title={t('storage.emptyTitle')}
          body={isOffline ? t('treatment.offlineNotCached') : t('storage.emptyBody')}
          actionLabel={radiusKm !== Infinity ? t('storage.expandRadius') : undefined}
          onAction={radiusKm !== Infinity ? () => setRadiusStep((s) => Math.min(s + 1, RADIUS_STEPS.length - 1)) : undefined}
        />
      ) : (
        <FlatList
          data={facilities}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => {
            const pct = item.capacityTonnes > 0 ? Math.round((item.availableTonnes / item.capacityTonnes) * 100) : 0;
            return (
              <TouchableOpacity
                className={`gap-2 rounded-2xl p-4 shadow-sm ${
                  selectedId === item.id ? 'border-2 border-brand-primary bg-surface' : 'border border-border bg-surface'
                }`}
                onPress={() => {
                  focusFacility(item.id);
                  router.push({
                    pathname: '/storage/[id]',
                    params: {
                      id: item.id,
                      lat: lat != null ? String(lat) : '',
                      lng: lng != null ? String(lng) : '',
                      commodity: commodity ?? '',
                    },
                  });
                }}
                accessibilityRole="button"
              >
                <View className="flex-row items-center justify-between">
                  <Text className="flex-1 font-sans-bold text-base text-ink-primary" numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text className="text-xs text-ink-secondary">{t('common.distanceAway', { distance: item.distanceKm })}</Text>
                </View>
                <AvailabilityBar
                  availableTonnes={item.availableTonnes}
                  capacityTonnes={item.capacityTonnes}
                  label={`${pct}% · ${t('storage.freeOfCapacity', { available: item.availableTonnes, capacity: item.capacityTonnes })}`}
                />
                <Text className="text-xs text-ink-secondary">
                  {t('storage.perQuintalPerDay', { cost: item.costPerDayRupeesPerQuintal })}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
