import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConfidenceBar } from '@/components/ConfidenceBar';
import { EmptyState } from '@/components/EmptyState';
import { ScreenHeader } from '@/components/ScreenHeader';
import { PENDING_DISEASE, ScanEntry } from '@/lib/storage/scan-history';
import { useScanHistoryStore } from '@/stores/scanHistoryStore';

export default function ScanHistoryScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const scans = useScanHistoryStore((s) => s.scans);
  const loaded = useScanHistoryStore((s) => s.loaded);
  const load = useScanHistoryStore((s) => s.load);
  const remove = useScanHistoryStore((s) => s.remove);

  useEffect(() => {
    if (!loaded) load();
  }, [loaded, load]);

  const onDelete = (scan: ScanEntry) => {
    Alert.alert('Delete this scan?', undefined, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.ok'), style: 'destructive', onPress: () => remove(scan.id) },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-app" edges={['top']}>
      <ScreenHeader title={t('history.title')} onBack={() => router.back()} />

      {scans.length === 0 ? (
        <EmptyState
          icon="🗂️"
          title={t('history.emptyTitle')}
          body={t('history.emptyBody')}
          actionLabel={t('history.scanNow')}
          onAction={() => router.push('/diagnose/capture')}
        />
      ) : (
        <FlatList
          data={scans}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, gap: 12 }}
          renderItem={({ item }) => {
            const isPending = item.disease === PENDING_DISEASE;
            return (
              <TouchableOpacity
                className="flex-row items-center gap-3 rounded-2xl border border-border bg-surface shadow-sm p-3"
                onPress={() => router.push({ pathname: '/diagnose/result', params: { scanId: item.id } })}
                accessibilityRole="button"
              >
                <Image
                  source={{ uri: item.imageUri }}
                  style={{ width: 56, height: 56, borderRadius: 12 }}
                  contentFit="cover"
                />
                <View className="flex-1 gap-1">
                  <Text className="font-sans-bold text-sm text-ink-primary" numberOfLines={1}>
                    {isPending
                      ? 'Pending analysis'
                      : t(`diagnose.diseaseNames.${item.disease}`, { defaultValue: item.disease })}
                  </Text>
                  {isPending ? (
                    <View className="self-start rounded-full bg-state-warning-bg px-2.5 py-0.5">
                      <Text className="text-xs font-sans-bold text-state-warning">⏳ Pending sync</Text>
                    </View>
                  ) : (
                    <ConfidenceBar confidence={item.confidence} />
                  )}
                  <Text className="text-xs text-ink-muted">
                    {new Date(item.capturedAt).toLocaleString()}
                  </Text>
                </View>
                <TouchableOpacity
                  className="h-9 w-9 items-center justify-center rounded-full bg-surface-muted"
                  onPress={() => onDelete(item)}
                  accessibilityRole="button"
                  accessibilityLabel="Delete"
                >
                  <Text>🗑️</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
