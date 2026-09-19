import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Linking, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { ScreenHeader } from '@/components/ScreenHeader';
import { getBuyers, getFpos } from '@/lib/api/endpoints';
import type { BuyerContact } from '@/lib/api/types';
import { useLocationStore } from '@/stores/locationStore';

type Tab = 'buyers' | 'fpos';

export default function BuyersDirectoryScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { lat, lng } = useLocationStore();
  const [tab, setTab] = useState<Tab>('buyers');

  const buyersQuery = useQuery({
    queryKey: ['buyers', lat, lng],
    queryFn: () => getBuyers(lat, lng),
  });
  const fposQuery = useQuery({
    queryKey: ['fpos', lat, lng],
    queryFn: () => getFpos(lat, lng),
  });

  const query = tab === 'buyers' ? buyersQuery : fposQuery;
  const entries = [...(query.data ?? [])].sort(
    (a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity),
  );

  return (
    <SafeAreaView className="flex-1 bg-surface-app" edges={['top']}>
      <ScreenHeader title={t('buyers.title')} onBack={() => router.back()} />

      <View className="mx-4 mb-3 mt-2 flex-row rounded-full border border-border bg-surface p-1">
        <TouchableOpacity
          className={`min-h-[40px] flex-1 items-center justify-center rounded-full ${
            tab === 'buyers' ? 'bg-brand-primary' : ''
          }`}
          onPress={() => setTab('buyers')}
          accessibilityRole="button"
        >
          <Text className={`font-sans-bold text-sm ${tab === 'buyers' ? 'text-white' : 'text-ink-primary'}`}>
            {t('buyers.tabBuyers')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`min-h-[40px] flex-1 items-center justify-center rounded-full ${
            tab === 'fpos' ? 'bg-brand-primary' : ''
          }`}
          onPress={() => setTab('fpos')}
          accessibilityRole="button"
        >
          <Text className={`font-sans-bold text-sm ${tab === 'fpos' ? 'text-white' : 'text-ink-primary'}`}>
            {t('buyers.tabFpos')}
          </Text>
        </TouchableOpacity>
      </View>

      {query.isLoading ? (
        <View className="gap-3 px-4">
          {[0, 1].map((i) => (
            <View key={i} className="h-28 rounded-2xl border border-border bg-surface shadow-sm p-4">
              <View className="h-3 w-1/2 rounded bg-surface-muted" />
            </View>
          ))}
        </View>
      ) : entries.length === 0 ? (
        <EmptyState
          icon="🤝"
          title={tab === 'buyers' ? t('buyers.noResultsBuyers') : t('buyers.noResultsFpos')}
          body={t('buyers.noResultsBody')}
        />
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => <BuyerCard entry={item} t={t} />}
        />
      )}
    </SafeAreaView>
  );
}

function BuyerCard({ entry, t }: { entry: BuyerContact; t: (key: string, opts?: Record<string, unknown>) => string }) {
  const [minQty, maxQty] = entry.quantityRangeKg;
  const quantityLabel = Number.isFinite(maxQty) ? `${minQty}–${maxQty} ${t('common.kg')}` : `${minQty}+ ${t('common.kg')}`;

  return (
    <View className="gap-2 rounded-2xl border border-border bg-surface shadow-sm p-4">
      <View className="flex-row items-start justify-between">
        <Text className="flex-1 font-sans-bold text-base text-ink-primary" numberOfLines={2}>
          {entry.name}
        </Text>
        {entry.verified && (
          <View className="rounded-full bg-brand-primary/10 px-2 py-1">
            <Text className="text-xs font-sans-bold text-brand-primary">✓ {t('buyers.verified')}</Text>
          </View>
        )}
      </View>

      <Text className="text-xs text-ink-secondary">
        {t('buyers.cropsAccepted')}: {entry.cropsAccepted.map((c) => t(`crops.${c}`)).join(', ')}
      </Text>
      <Text className="text-xs text-ink-secondary">
        {t('buyers.quantityWindow')}: {quantityLabel}
      </Text>
      {entry.indicativePricePerKg != null && (
        <Text className="text-sm font-sans-bold text-brand-primary">
          {t('buyers.indicativePrice')}: ₹{entry.indicativePricePerKg}/{t('common.kg')}
        </Text>
      )}
      {entry.distanceKm != null && (
        <Text className="text-xs text-ink-secondary">{t('common.distanceAway', { distance: entry.distanceKm })}</Text>
      )}

      <TouchableOpacity
        className="mt-1 min-h-[48px] items-center justify-center rounded-full bg-brand-primary"
        onPress={() => Linking.openURL(`tel:${entry.phone}`)}
        accessibilityRole="button"
      >
        <Text className="font-sans-bold text-sm text-white">📞 {t('common.call')}</Text>
      </TouchableOpacity>
    </View>
  );
}
