import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AvailabilityBar } from '@/components/AvailabilityBar';
import { EmptyState } from '@/components/EmptyState';
import { OsmMapView, type OsmMapViewHandle } from '@/components/OsmMapView';
import { ScreenHeader } from '@/components/ScreenHeader';
import { StaleBadge } from '@/components/StaleBadge';
import { getColdStorage } from '@/lib/api/endpoints';
import { useIsOnline } from '@/lib/network/connectivity';
import { useLocationStore } from '@/stores/locationStore';

const DEFAULT_CENTER = { lat: 16.3067, lng: 80.4365 };
const RADIUS_STEPS = [10, 25, 50, Infinity];

export default function ColdStorageScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const isOnline = useIsOnline();
  const params = useLocalSearchParams<{ destinationLat?: string; destinationLng?: string }>();
  const mapRef = useRef<OsmMapViewHandle>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [radiusStep, setRadiusStep] = useState(0);

  const liveLocation = useLocationStore();
  // A destination chosen on the Sell Smart screen wins (storage near *that* buyer/mandi);
  // otherwise fall back to the device's live location so this screen works standalone too.
  const lat = params.destinationLat ? Number(params.destinationLat) : liveLocation.lat;
  const lng = params.destinationLng ? Number(params.destinationLng) : liveLocation.lng;

  const query = useQuery({
    queryKey: ['coldStorage', lat, lng],
    queryFn: () => getColdStorage(lat, lng),
  });

  const isOffline = query.fetchStatus === 'paused';
  const radiusKm = RADIUS_STEPS[radiusStep];
  const facilities = (query.data ?? []).filter((f) => f.distanceKm <= radiusKm);

  const mapCenter = lat != null && lng != null ? { lat, lng } : DEFAULT_CENTER;

  // The map's initial HTML is only built once on mount (reloading it to recenter
  // would refetch every OSM tile), so once live GPS resolves after that first
  // render, pan the already-loaded map to it explicitly.
  useEffect(() => {
    if (lat == null || lng == null) return;
    mapRef.current?.panTo(lat, lng);
  }, [lat, lng]);

  const focusFacility = (facilityId: string) => {
    setSelectedId(facilityId);
    const facility = query.data?.find((f) => f.id === facilityId);
    if (facility) {
      mapRef.current?.panTo(facility.lat, facility.lng);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-app" edges={['top']}>
      <ScreenHeader title={t('home.tileStore')} subtitle={t('home.tileStoreSub')} onBack={() => router.back()} />

      <View className="mx-4 mb-3 overflow-hidden rounded-3xl shadow-md" style={{ elevation: 3, height: 200 }}>
        <OsmMapView
          ref={mapRef}
          center={mapCenter}
          markers={(query.data ?? []).map((facility) => ({
            id: facility.id,
            lat: facility.lat,
            lng: facility.lng,
            title: facility.name,
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
          title="No facilities nearby"
          body={isOffline ? t('treatment.offlineNotCached') : 'No cold storage found within this radius.'}
          actionLabel={radiusKm !== Infinity ? 'Expand search radius' : undefined}
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
                    params: { id: item.id, lat: lat != null ? String(lat) : '', lng: lng != null ? String(lng) : '' },
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
                  label={`${pct}% free · ${item.availableTonnes}t of ${item.capacityTonnes}t`}
                />
                <Text className="text-xs text-ink-secondary">₹{item.costPerDayRupeesPerQuintal}/quintal/day</Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
