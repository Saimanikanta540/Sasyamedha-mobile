import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DisclaimerBanner } from '@/components/DisclaimerBanner';
import { EmptyState } from '@/components/EmptyState';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SpeakerButton } from '@/components/SpeakerButton';
import { StaleBadge } from '@/components/StaleBadge';
import { getTreatment } from '@/lib/api/endpoints';

export default function TreatmentGuidanceScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { disease, scanId } = useLocalSearchParams<{ disease: string; scanId?: string }>();

  const query = useQuery({
    queryKey: ['treatment', disease],
    queryFn: () => getTreatment(disease),
  });

  const isOffline = query.fetchStatus === 'paused';
  const diseaseName = t(`diagnose.diseaseNames.${disease}`, { defaultValue: disease ?? '' });

  const onDone = () => {
    if (scanId) router.push('/home');
    else router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-app" edges={['top']}>
      <ScreenHeader title={t('treatment.title')} subtitle={diseaseName} onBack={() => router.back()} />

      {query.data ? (
        <ScrollView contentContainerClassName="gap-4 px-4 pb-12">
          <View className="flex-row items-center justify-between">
            {isOffline ? <StaleBadge label={t('connectivity.offlineBadge')} /> : <View />}
            <SpeakerButton
              text={[
                ...query.data.symptoms,
                ...query.data.immediateActions,
                ...query.data.prevention,
              ].join('. ')}
              compact
            />
          </View>

          <DisclaimerBanner text={t('treatment.disclaimer')} />

          <Section title={t('treatment.symptoms')} items={query.data.symptoms} />
          <Section title={t('treatment.immediateActions')} items={query.data.immediateActions} numbered />
          <Section title={t('treatment.prevention')} items={query.data.prevention} />

          <View className="gap-2 rounded-2xl border border-border bg-surface shadow-sm p-4">
            <Text className="font-sans-bold text-sm text-ink-secondary">
              {t('treatment.indicativeCost')}
            </Text>
            {query.data.indicativeCost.map((line) => (
              <View key={line.label} className="flex-row justify-between">
                <Text className="flex-1 text-sm text-ink-primary">{line.label}</Text>
                <Text className="font-sans-bold text-sm text-ink-primary">₹{line.amountRupees}</Text>
              </View>
            ))}
            <View className="h-px bg-border" />
            <View className="flex-row justify-between">
              <Text className="font-sans-bold text-sm text-ink-primary">Total</Text>
              <Text className="font-sans-bold text-base text-brand-primary">
                ₹{query.data.indicativeCost.reduce((sum, l) => sum + l.amountRupees, 0)}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            className="min-h-[52px] items-center justify-center rounded-full bg-brand-primary"
            onPress={onDone}
            accessibilityRole="button"
          >
            <Text className="font-sans-bold text-base text-white">{t('common.ok')}</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : isOffline ? (
        <EmptyState
          icon="📡"
          title={t('connectivity.offlineBadge')}
          body={t('treatment.offlineNotCached')}
        />
      ) : query.isLoading ? (
        <View className="gap-4 px-4 pt-2">
          <Text className="text-sm text-ink-secondary">{t('treatment.loading')}</Text>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} className="gap-2 rounded-2xl border border-border bg-surface shadow-sm p-4">
              <View className="h-3 w-1/3 rounded bg-surface-muted" />
              <View className="h-3 w-full rounded bg-surface-muted" />
              <View className="h-3 w-4/5 rounded bg-surface-muted" />
            </View>
          ))}
        </View>
      ) : (
        <EmptyState
          icon="⚠️"
          title={t('treatment.title')}
          body={t('treatment.offlineNotCached')}
          actionLabel={t('common.retry')}
          onAction={() => query.refetch()}
        />
      )}
    </SafeAreaView>
  );
}

function Section({ title, items, numbered }: { title: string; items: string[]; numbered?: boolean }) {
  return (
    <View className="gap-2 rounded-2xl border border-border bg-surface shadow-sm p-4">
      <Text className="font-sans-bold text-sm text-ink-secondary">{title}</Text>
      {items.map((item, i) => (
        <View key={item} className="flex-row gap-2">
          <Text className="text-sm text-ink-primary">{numbered ? `${i + 1}.` : '•'}</Text>
          <Text className="flex-1 text-sm leading-5 text-ink-primary">{item}</Text>
        </View>
      ))}
    </View>
  );
}
