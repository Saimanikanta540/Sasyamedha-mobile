import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { ScreenHeader } from '@/components/ScreenHeader';
import { PriceChartWidget } from '@/components/PriceChartWidget';
import { getPrices } from '@/lib/api/endpoints';

export default function MarketPriceDetailScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { market, commodity } = useLocalSearchParams<{ market: string; commodity: string }>();

  // Same query key as the list screen — this reads the already-fetched cache, no new request.
  const query = useQuery({
    queryKey: ['prices', commodity],
    queryFn: () => getPrices(commodity),
  });

  const record = query.data?.records.find((r) => r.market === market);

  return (
    <SafeAreaView className="flex-1 bg-surface-app" edges={['top']}>
      <ScreenHeader title={market} subtitle={commodity} onBack={() => router.back()} />

      {record ? (
        <View className="gap-4 px-4">
          <View className="items-center gap-1 rounded-3xl bg-brand-primary p-6 shadow-md" style={{ elevation: 3 }}>
            <Text className="text-xs font-sans-bold uppercase tracking-wide text-white/70">Modal price</Text>
            <Text className="font-sans-bold text-4xl text-white">
              ₹{record.modalPriceRupeesPerQuintal}
            </Text>
            <Text className="text-xs text-white/70">per quintal · {commodity}</Text>
          </View>
          <View className="flex-row gap-3">
            <View className="flex-1 gap-1 rounded-2xl border border-border bg-surface shadow-sm p-4">
              <Text className="text-xs text-ink-secondary">Min</Text>
              <Text className="font-sans-bold text-lg text-ink-primary">
                ₹{record.minPriceRupeesPerQuintal}
              </Text>
            </View>
            <View className="flex-1 gap-1 rounded-2xl border border-border bg-surface shadow-sm p-4">
              <Text className="text-xs text-ink-secondary">Max</Text>
              <Text className="font-sans-bold text-lg text-ink-primary">
                ₹{record.maxPriceRupeesPerQuintal}
              </Text>
            </View>
          </View>
          {record.distanceKm != null && (
            <Text className="text-sm text-ink-secondary mt-2">
              {t('common.distanceAway', { distance: record.distanceKm })}
            </Text>
          )}
          <PriceChartWidget modalPrice={record.modalPriceRupeesPerQuintal} />

          {false && (
            <Text className="text-sm text-ink-secondary">
              {t('common.distanceAway', { distance: record.distanceKm })}
            </Text>
          )}
          {query.data && (
            <Text className="text-xs text-ink-muted">
              {t('settings.lastSync')}: {new Date(query.data.asOf).toLocaleString()}
            </Text>
          )}
        </View>
      ) : (
        <EmptyState icon="📊" title={t('history.emptyTitle')} body={t('treatment.offlineNotCached')} />
      )}
    </SafeAreaView>
  );
}
