import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { KNOWN_DISEASES } from '@/lib/api/mock-data';

const DISEASE_ICON: Record<string, string> = {
  early_blight: '🍁',
  late_blight: '🍂',
  target_spot: '🎯',
  yellow_leaf_curl_virus: '🌀',
  mosaic_virus: '🧩',
  healthy: '🌿',
};

export default function TreatmentPickerScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <SafeAreaView className="flex-1 bg-surface-app" edges={['top']}>
      <ScreenHeader title={t('treatment.browseTitle')} onBack={() => router.back()} />

      <ScrollView contentContainerClassName="gap-3 px-4 pb-12 pt-2">
        {KNOWN_DISEASES.filter((d) => d !== 'healthy').map((disease) => (
          <TouchableOpacity
            key={disease}
            className="min-h-[68px] flex-row items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm"
            onPress={() => router.push({ pathname: '/treatment/[disease]', params: { disease } })}
            accessibilityRole="button"
          >
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-surface-app">
              <Text className="text-2xl">{DISEASE_ICON[disease] ?? '🌱'}</Text>
            </View>
            <Text className="flex-1 font-sans-bold text-base text-ink-primary">
              {t(`diagnose.diseaseNames.${disease}`, { defaultValue: disease })}
            </Text>
            <Text className="text-lg text-ink-muted">›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
