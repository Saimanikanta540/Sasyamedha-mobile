import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { getBuyer } from '@/lib/api/endpoints';
import type { SellDestinationBreakdown } from '@/lib/api/types';
import { useSessionStore } from '@/stores/sessionStore';

export default function DestinationDetailScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{
    id: string;
    name: string;
    type: string;
    netReturn: string;
    breakdown: string;
    buyerId?: string;
  }>();
  const { commodity, quantityKg } = useSessionStore();

  const breakdown: SellDestinationBreakdown = JSON.parse(params.breakdown);
  const netReturn = Number(params.netReturn);

  const buyerQuery = useQuery({
    queryKey: ['buyer', params.buyerId],
    queryFn: () => getBuyer(params.buyerId as string),
    enabled: Boolean(params.buyerId),
  });

  const openStore = () => {
    router.push({
      pathname: '/storage',
      params: {
        destinationLat: buyerQuery.data ? String(buyerQuery.data.lat) : '',
        destinationLng: buyerQuery.data ? String(buyerQuery.data.lng) : '',
        commodity: commodity ?? '',
        quantity: quantityKg ? String(quantityKg) : '',
      },
    });
  };

  const openTransport = () => {
    router.push({
      pathname: '/transport',
      params: {
        destinationId: params.id,
        commodity: commodity ?? '',
        quantity: quantityKg ? String(quantityKg) : '',
        pickupLat: buyerQuery.data ? String(buyerQuery.data.lat) : '',
        pickupLng: buyerQuery.data ? String(buyerQuery.data.lng) : '',
        destinationName: params.name,
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-app" edges={['top']}>
      <ScreenHeader title={params.name} subtitle={t('destination.subtitle')} onBack={() => router.back()} />

      <ScrollView contentContainerClassName="gap-4 px-4 pb-12">
        <View className="items-center gap-1 rounded-3xl bg-brand-primary p-6 shadow-md" style={{ elevation: 3 }}>
          <Text className="text-xs font-sans-bold uppercase tracking-wide text-white/70">{t('destination.netReturn')}</Text>
          <Text className="font-sans-bold text-4xl text-white">₹{netReturn.toLocaleString()}</Text>
        </View>

        <View className="gap-2 rounded-2xl border border-border bg-surface shadow-sm p-4">
          <Text className="font-sans-bold text-sm text-ink-secondary">{t('destination.fullBreakdown')}</Text>
          <Row label={t('destination.grossValue')} value={breakdown.grossValueRupees} />
          <Row label={t('destination.transportCost')} value={-breakdown.transportCostRupees} />
          <Row label={t('destination.storageCost')} value={-breakdown.storageCostRupees} />
          <Row label={t('destination.marketMargin')} value={-breakdown.marketMarginRupees} />
          <View className="h-px bg-border" />
          <Row label={t('destination.netReturn')} value={netReturn} bold />
        </View>

        {params.buyerId ? (
          <View className="gap-3 rounded-2xl border border-border bg-surface shadow-sm p-4">
            <Text className="font-sans-bold text-sm text-ink-secondary">{t('destination.buyerContact')}</Text>
            {buyerQuery.isLoading ? (
              <Text className="text-sm text-ink-secondary">{t('common.loading')}</Text>
            ) : buyerQuery.data ? (
              <>
                <Text className="font-sans-bold text-base text-ink-primary">{buyerQuery.data.name}</Text>
                <Text className="text-sm text-ink-secondary">{buyerQuery.data.address}</Text>
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    className="min-h-[48px] flex-1 items-center justify-center rounded-full bg-brand-primary"
                    onPress={() => Linking.openURL(`tel:${buyerQuery.data!.phone}`)}
                    accessibilityRole="button"
                  >
                    <Text className="font-sans-bold text-sm text-white">📞 {t('common.call')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="min-h-[48px] flex-1 items-center justify-center rounded-full border border-brand-primary"
                    onPress={() => Linking.openURL(`sms:${buyerQuery.data!.phone}`)}
                    accessibilityRole="button"
                  >
                    <Text className="font-sans-bold text-sm text-brand-primary">💬 {t('common.message')}</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <Text className="text-sm text-ink-secondary">{t('treatment.offlineNotCached')}</Text>
            )}
          </View>
        ) : null}

        <View className="gap-3">
          <TouchableOpacity
            className="min-h-[52px] items-center justify-center rounded-full bg-brand-primary"
            onPress={openStore}
            accessibilityRole="button"
          >
            <Text className="font-sans-bold text-base text-white">{t('destination.arrangeStorage')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="min-h-[52px] items-center justify-center rounded-full bg-brand-accent"
            onPress={openTransport}
            accessibilityRole="button"
          >
            <Text className="font-sans-bold text-base text-white">{t('destination.arrangeTransport')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <View className="flex-row justify-between">
      <Text className={`text-sm ${bold ? 'font-sans-bold text-ink-primary' : 'text-ink-secondary'}`}>
        {label}
      </Text>
      <Text
        className={`text-sm ${bold ? 'font-sans-bold text-brand-primary' : value < 0 ? 'font-sans-bold text-state-danger' : 'text-ink-primary'}`}
      >
        {value < 0 ? '−' : ''}₹{Math.abs(value).toLocaleString()}
      </Text>
    </View>
  );
}
