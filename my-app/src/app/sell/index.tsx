import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { StaleBadge } from '@/components/StaleBadge';
import { postSellSmart } from '@/lib/api/endpoints';
import type { SellDestination } from '@/lib/api/types';
import { useIsOnline } from '@/lib/network/connectivity';
import { useSessionStore } from '@/stores/sessionStore';

const COMMODITIES = ['tomato', 'chilli', 'paddy', 'cotton'] as const;
const COMMODITY_LABEL: Record<(typeof COMMODITIES)[number], string> = {
  tomato: 'Tomato',
  chilli: 'Chilli',
  paddy: 'Paddy',
  cotton: 'Cotton',
};
const QUANTITY_STEP = 50;

export default function SellSmartScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const isOnline = useIsOnline();
  const setSession = useSessionStore((s) => s.set);

  const [commodity, setCommodity] = useState<(typeof COMMODITIES)[number]>('tomato');
  const [quantityKg, setQuantityKg] = useState(0);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const query = useQuery({
    queryKey: ['sellSmart', commodity, quantityKg],
    queryFn: () => postSellSmart({ commodity, quantityKg }),
    enabled: false,
  });

  const canCalculate = quantityKg > 0;
  const onCalculate = () => {
    if (!canCalculate) return;
    setSession(commodity, quantityKg);
    query.refetch();
  };

  const isOffline = query.fetchStatus === 'paused';
  const destinations = [...(query.data?.destinations ?? [])].sort(
    (a, b) => b.netReturnRupees - a.netReturnRupees,
  );
  const bestReturn = destinations[0]?.netReturnRupees ?? 0;

  const openDestination = (dest: SellDestination) => {
    router.push({
      pathname: '/destination/[id]',
      params: {
        id: dest.id,
        netReturn: String(dest.netReturnRupees),
        breakdown: JSON.stringify(dest.breakdown),
        name: dest.name,
        type: dest.type,
        buyerId: dest.buyerId ?? '',
      },
    });
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
        <Text className="font-sans-bold text-lg text-ink-primary">{t('home.tileSell')}</Text>
      </View>

      <ScrollView contentContainerClassName="gap-4 px-4 pb-12">
        <View className="gap-3 rounded-2xl border border-border bg-surface p-4">
          <Text className="font-sans-bold text-xs text-ink-secondary">{t('home.tileSellSub')}</Text>
          <View className="flex-row flex-wrap gap-2">
            {COMMODITIES.map((c) => (
              <TouchableOpacity
                key={c}
                className={`min-h-[40px] justify-center rounded-full border px-4 ${
                  commodity === c ? 'border-brand-primary bg-brand-primary' : 'border-border bg-surface-app'
                }`}
                onPress={() => setCommodity(c)}
                accessibilityRole="button"
              >
                <Text className={`font-sans-bold text-sm ${commodity === c ? 'text-white' : 'text-ink-primary'}`}>
                  {COMMODITY_LABEL[c]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="flex-row items-center justify-between rounded-xl border border-border bg-surface-app p-2">
            <TouchableOpacity
              className="h-11 w-11 items-center justify-center rounded-lg bg-surface"
              onPress={() => setQuantityKg((q) => Math.max(0, q - QUANTITY_STEP))}
              accessibilityRole="button"
            >
              <Text className="text-lg text-ink-primary">−</Text>
            </TouchableOpacity>
            <Text className="font-sans-bold text-lg text-ink-primary">
              {quantityKg} {t('common.kg')}
            </Text>
            <TouchableOpacity
              className="h-11 w-11 items-center justify-center rounded-lg bg-surface"
              onPress={() => setQuantityKg((q) => q + QUANTITY_STEP)}
              accessibilityRole="button"
            >
              <Text className="text-lg text-ink-primary">+</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className={`min-h-[52px] items-center justify-center rounded-full ${
              canCalculate ? 'bg-brand-primary' : 'bg-surface-muted'
            }`}
            onPress={onCalculate}
            disabled={!canCalculate || query.isFetching}
            accessibilityRole="button"
          >
            <Text className={`font-sans-bold text-base ${canCalculate ? 'text-white' : 'text-ink-muted'}`}>
              {query.isFetching ? 'Calculating best return…' : t('common.calculate')}
            </Text>
          </TouchableOpacity>
        </View>

        {query.isFetching && !query.data && (
          <Text className="text-center text-sm text-ink-secondary">Calculating best return…</Text>
        )}

        {!query.data && isOffline && (
          <EmptyState icon="📡" title={t('connectivity.offlineBadge')} body={t('treatment.offlineNotCached')} />
        )}

        {!query.data && query.isError && (
          <EmptyState
            icon="⚠️"
            title={t('common.retry')}
            body={t('treatment.offlineNotCached')}
            actionLabel={t('common.retry')}
            onAction={onCalculate}
          />
        )}

        {query.data && (
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-xs text-ink-muted">
                {new Date(query.data.calculatedAt).toLocaleString()}
              </Text>
              {isOffline && <StaleBadge label={t('connectivity.offlineBadge')} />}
            </View>

            {destinations.map((dest, index) => {
              const delta = dest.netReturnRupees - bestReturn;
              const isExpanded = Boolean(expanded[dest.id]);
              return (
                <View key={dest.id} className="gap-2 rounded-2xl border border-border bg-surface p-4">
                  <View className="flex-row items-center justify-between">
                    <Text className="font-sans-bold text-base text-ink-primary">{dest.name}</Text>
                    {index === 0 && (
                      <View className="rounded-full bg-state-success-bg px-3 py-1">
                        <Text className="font-sans-bold text-xs text-state-success">Best return</Text>
                      </View>
                    )}
                  </View>
                  <Text className="font-sans-bold text-3xl text-brand-primary">
                    ₹{dest.netReturnRupees.toLocaleString()}
                  </Text>
                  <Text className={`text-xs font-sans-bold ${delta >= 0 ? 'text-state-success' : 'text-state-danger'}`}>
                    {delta >= 0 ? '+₹0 (best)' : `−₹${Math.abs(delta).toLocaleString()} vs best`}
                  </Text>

                  <TouchableOpacity
                    onPress={() => setExpanded((e) => ({ ...e, [dest.id]: !isExpanded }))}
                    accessibilityRole="button"
                  >
                    <Text className="text-xs font-sans-bold text-brand-primary">
                      {isExpanded ? '▲ Hide breakdown' : '▼ Show breakdown'}
                    </Text>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View className="gap-1 border-t border-border pt-2">
                      <BreakdownRow label="Gross value" value={dest.breakdown.grossValueRupees} />
                      <BreakdownRow label="Transport" value={-dest.breakdown.transportCostRupees} />
                      <BreakdownRow label="Storage" value={-dest.breakdown.storageCostRupees} />
                      <BreakdownRow label="Market margin" value={-dest.breakdown.marketMarginRupees} />
                    </View>
                  )}

                  <TouchableOpacity
                    className="mt-1 min-h-[44px] items-center justify-center rounded-full bg-brand-primary"
                    onPress={() => openDestination(dest)}
                    accessibilityRole="button"
                  >
                    <Text className="font-sans-bold text-sm text-white">{t('common.viewDetails')}</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function BreakdownRow({ label, value }: { label: string; value: number }) {
  return (
    <View className="flex-row justify-between">
      <Text className="text-xs text-ink-secondary">{label}</Text>
      <Text className={`text-xs font-sans-bold ${value < 0 ? 'text-state-danger' : 'text-ink-primary'}`}>
        {value < 0 ? '−' : ''}₹{Math.abs(value).toLocaleString()}
      </Text>
    </View>
  );
}
