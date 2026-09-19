import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { LinearGradient } from '@/components/LinearGradient';
import { ScreenHeader } from '@/components/ScreenHeader';
import { StaleBadge } from '@/components/StaleBadge';
import { getPrices } from '@/lib/api/endpoints';
import type { MarketPriceRecord } from '@/lib/api/types';
import { useIsOnline } from '@/lib/network/connectivity';
import { useLocationStore } from '@/stores/locationStore';

const COMMODITIES = ['tomato', 'chilli', 'paddy', 'cotton'] as const;

export default function MarketPricesScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const isOnline = useIsOnline();
  const [commodity, setCommodity] = useState<(typeof COMMODITIES)[number]>('tomato');
  const { lat, lng } = useLocationStore();

  const query = useQuery({
    queryKey: ['prices', commodity, lat, lng],
    queryFn: () => getPrices(commodity, lat, lng),
  });

  const isOffline = query.fetchStatus === 'paused';
  const records = [...(query.data?.records ?? [])].sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
  const avgPrice = records.length > 0 ? Math.round(records.reduce((acc, r) => acc + (r.modalPriceRupeesPerQuintal || 0), 0) / records.length) : 0;

  return (
    <SafeAreaView className="flex-1 bg-surface-app" edges={['top']}>
      <ScreenHeader title={t('home.tilePrices')} subtitle={t('prices.subtitle')} onBack={() => router.back()} />

      <FlatList
        data={COMMODITIES}
        horizontal
        keyExtractor={(c) => c}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingBottom: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            className={`min-h-[44px] justify-center rounded-full px-5 shadow-sm ${
              commodity === item ? 'bg-brand-primary' : 'bg-white border border-border'
            }`}
            onPress={() => setCommodity(item)}
          >
            <Text
              className={`font-sans-bold text-sm ${commodity === item ? 'text-white' : 'text-ink-primary'}`}
            >
              {t(`crops.${item}`)}
            </Text>
          </TouchableOpacity>
        )}
      />

      {isOffline && query.data && (
        <View className="mx-4 mb-4">
          <StaleBadge label={`${t('connectivity.offlineBadge')} · ${new Date(query.data.asOf).toLocaleTimeString()}`} />
        </View>
      )}
      
      {!query.isLoading && records.length > 0 && (
         <View className="px-4 mb-4">
           <LinearGradient
              colors={['#10B981', '#059669']}
              className="rounded-3xl p-5 shadow-md flex-row justify-between items-center"
           >
              <View>
                 <Text className="text-white/80 text-xs uppercase font-sans-bold mb-1">{t('prices.stateAverage')}</Text>
                 <Text className="text-white text-3xl font-sans-bold">₹{avgPrice}</Text>
                 <Text className="text-white/80 text-xs mt-1">{t('prices.perQuintal')}</Text>
              </View>
              <View className="bg-white/20 h-14 w-14 rounded-full items-center justify-center">
                 <Text className="text-2xl">📈</Text>
              </View>
           </LinearGradient>
         </View>
      )}

      {query.isLoading ? (
        <View className="gap-3 px-4">
          {[0, 1, 2, 3].map((i) => (
            <View key={i} className="h-24 rounded-3xl border border-border bg-white shadow-sm p-4 justify-center">
              <View className="h-4 w-1/3 rounded bg-surface-muted mb-2" />
              <View className="h-6 w-1/4 rounded bg-surface-muted" />
            </View>
          ))}
        </View>
      ) : records.length === 0 ? (
        <EmptyState
          icon="📊"
          title={t('history.emptyTitle')}
          body={isOffline ? t('treatment.offlineNotCached') : t('history.emptyBody')}
          actionLabel={isOffline ? undefined : t('prices.tryAnother')}
          onAction={isOffline ? undefined : () => setCommodity(commodity === 'tomato' ? 'chilli' : 'tomato')}
        />
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.market}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, gap: 14 }}
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
  const { t } = useTranslation();
  const isHigh = (record.modalPriceRupeesPerQuintal || 0) > (record.minPriceRupeesPerQuintal || 0) + 100;
  return (
    <TouchableOpacity
      className="rounded-3xl border border-border bg-white shadow-sm p-5"
      onPress={onPress}
      accessibilityRole="button"
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1 pr-4">
          <Text className="font-sans-bold text-lg text-ink-primary leading-6">
            {record.market}
          </Text>
        </View>
        {record.distanceKm != null && (
          <View className="rounded-full bg-brand-primary/10 px-3 py-1.5 flex-row items-center">
             <Text className="text-xs font-sans-bold text-brand-primary">📍 {record.distanceKm} km</Text>
          </View>
        )}
      </View>

      <View className="flex-row items-end justify-between">
         <View className="flex-row items-baseline gap-1.5">
           <Text className="font-sans-bold text-3xl text-brand-primary">
             ₹{record.modalPriceRupeesPerQuintal}
           </Text>
           <Text className="text-sm font-sans-bold text-ink-secondary">/qtl</Text>
         </View>
         <View className={`rounded-xl px-2 py-1 ${isHigh ? 'bg-green-100' : 'bg-orange-100'}`}>
            <Text className={`text-xs font-sans-bold ${isHigh ? 'text-green-700' : 'text-orange-700'}`}>
               {isHigh ? t('prices.good') : t('prices.average')}
            </Text>
         </View>
      </View>

      <View className="h-px bg-border my-3" />
      <View className="flex-row justify-between items-center">
         <Text className="text-xs text-ink-secondary font-sans-bold">{t('prices.min')}: <Text className="text-ink-primary">₹{record.minPriceRupeesPerQuintal}</Text></Text>
         <Text className="text-xs text-ink-secondary font-sans-bold">{t('prices.max')}: <Text className="text-ink-primary">₹{record.maxPriceRupeesPerQuintal}</Text></Text>
      </View>
    </TouchableOpacity>
  );
}
