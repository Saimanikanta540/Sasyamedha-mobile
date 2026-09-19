import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { KNOWN_DISEASES } from '@/lib/api/mock-data';

const DISEASE_ICON: Record<string, string> = {
  late_blight: '🍂',
  leaf_curl_virus: '🌀',
  healthy: '🌿',
};

export default function TreatmentPickerScreen() {
  const router = useRouter();
  const { t } = useTranslation();

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
        <Text className="font-sans-bold text-lg text-ink-primary">{t('treatment.browseTitle')}</Text>
      </View>

      <ScrollView contentContainerClassName="gap-3 px-4 pb-12 pt-2">
        {KNOWN_DISEASES.filter((d) => d !== 'healthy').map((disease) => (
          <TouchableOpacity
            key={disease}
            className="min-h-[64px] flex-row items-center gap-3 rounded-2xl border border-border bg-surface p-4"
            onPress={() => router.push({ pathname: '/treatment/[disease]', params: { disease } })}
            accessibilityRole="button"
          >
            <Text className="text-2xl">{DISEASE_ICON[disease] ?? '🌱'}</Text>
            <Text className="flex-1 font-sans-bold text-base text-ink-primary">
              {t(`diagnose.diseaseNames.${disease}`, { defaultValue: disease })}
            </Text>
            <Text className="text-ink-muted">›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
