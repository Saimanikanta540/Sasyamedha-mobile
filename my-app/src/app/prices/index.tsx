import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { StaleBadge } from '@/components/StaleBadge';
import { getPrices } from '@/lib/api/endpoints';
import type { MarketPriceRecord } from '@/lib/api/types';
import { useIsOnline } from '@/lib/network/connectivity';

const COMMODITIES = ['tomato', 'chilli', 'paddy', 'cotton'] as const;
const COMMODITY_LABEL: Record<(typeof COMMODITIES)[number], string> = {
  tomato: 'Tomato',
  chilli: 'Chilli',
  paddy: 'Paddy',
  cotton: 'Cotton',
};

export default function MarketPricesScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const isOnline = useIsOnline();
  const [commodity, setCommodity] = useState<(typeof COMMODITIES)[number]>('tomato');

  const query = useQuery({
    queryKey: ['prices', commodity],
    queryFn: () => getPrices(commodity),
  });

  const isOffline = query.fetchStatus === 'paused';
  const records = [...(query.data?.records ?? [])].sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));

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
        <Text className="font-sans-bold text-lg text-ink-primary">{t('home.tilePrices')}</Text>
      </View>

      <FlatList
        data={COMMODITIES}
        horizontal
        keyExtractor={(c) => c}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingBottom: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            className={`min-h-[40px] justify-center rounded-full border px-4 ${
              commodity === item ? 'border-brand-primary bg-brand-primary' : 'border-border bg-surface'
            }`}
            onPress={() => setCommodity(item)}
            accessibilityRole="button"
          >
            <Text
              className={`font-sans-bold text-sm ${commodity === item ? 'text-white' : 'text-ink-primary'}`}
            >
              {COMMODITY_LABEL[item]}
            </Text>
          </TouchableOpacity>
        )}
      />

      {isOffline && query.data && (
        <View className="mx-4 mb-2">
          <StaleBadge label={`${t('connectivity.offlineBadge')} · ${new Date(query.data.asOf).toLocaleTimeString()}`} />
        </View>
      )}

      {query.isLoading ? (
        <View className="gap-3 px-4">
          {[0, 1, 2, 3].map((i) => (
            <View key={i} className="h-20 rounded-2xl border border-border bg-surface p-4">
              <View className="h-3 w-1/2 rounded bg-surface-muted" />
            </View>
          ))}
        </View>
      ) : records.length === 0 ? (
        <EmptyState
          icon="📊"
          title={t('history.emptyTitle')}
          body={isOffline ? t('treatment.offlineNotCached') : t('history.emptyBody')}
          actionLabel={isOffline ? undefined : 'Try another commodity'}
          onAction={isOffline ? undefined : () => setCommodity(commodity === 'tomato' ? 'chilli' : 'tomato')}
        />
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.market}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, gap: 12 }}
          refreshControl={
            <RefreshControl
              refreshing={query.isFetching && !query.isLoading}
              onRefresh={isOnline ? () => query.refetch() : undefined}
              enabled={isOnline}
            />
          }
          renderItem={({ item }) => <PriceRow record={item} onPress={() => router.push({ pathname: '/prices/[market]', params: { market: item.market, commodity } })} />}
        />
      )}
    </SafeAreaView>
  );
}

function PriceRow({ record, onPress }: { record: MarketPriceRecord; onPress: () => void }) {
  return (
    <TouchableOpacity
      className="gap-1 rounded-2xl border border-border bg-surface p-4"
      onPress={onPress}
      accessibilityRole="button"
    >
      <View className="flex-row items-center justify-between">
        <Text className="font-sans-bold text-base text-ink-primary">{record.market}</Text>
        {record.distanceKm != null && (
          <Text className="text-xs text-ink-secondary">{record.distanceKm} km</Text>
        )}
      </View>
      <Text className="font-sans-bold text-2xl text-brand-primary">
        ₹{record.modalPriceRupeesPerQuintal}
        <Text className="text-xs font-sans-medium text-ink-secondary"> /quintal</Text>
      </Text>
      <Text className="text-xs text-ink-secondary">
        ₹{record.minPriceRupeesPerQuintal} – ₹{record.maxPriceRupeesPerQuintal}
      </Text>
    </TouchableOpacity>
  );
}
