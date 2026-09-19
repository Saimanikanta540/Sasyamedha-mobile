import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConfidenceBar } from '@/components/ConfidenceBar';
import { EmptyState } from '@/components/EmptyState';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SpeakerButton } from '@/components/SpeakerButton';
import { diagnose } from '@/lib/api/endpoints';
import { PENDING_DISEASE, ScanEntry } from '@/lib/storage/scan-history';
import { loadScanById, useScanHistoryStore } from '@/stores/scanHistoryStore';

const CONFIDENCE_THRESHOLD = 0.6;
const EXPERT_HELPLINE = 'tel:18001801551';

export default function DiagnosisResultScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ scanId: string; imageUri?: string }>();
  const scanId = params.scanId;
  const routeImageUri = params.imageUri;

  const storeScan = useScanHistoryStore((s) => s.scans.find((x) => x.id === scanId));
  const addComplete = useScanHistoryStore((s) => s.addComplete);

  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'error' | 'done'>('idle');
  const [localResult, setLocalResult] = useState<{ disease: string; confidence: number } | null>(
    null,
  );
  // Replay only ever passes a scanId (no imageUri). If this screen mounted before the
  // scan history store finished hydrating from SQLite, fall back to a direct lookup
  // rather than treating a real saved scan as missing.
  const [fallbackScan, setFallbackScan] = useState<ScanEntry | null>(null);

  useEffect(() => {
    if (storeScan || routeImageUri || !scanId) return;
    let cancelled = false;
    loadScanById(scanId).then((found) => {
      if (!cancelled) setFallbackScan(found);
    });
    return () => {
      cancelled = true;
    };
  }, [storeScan, routeImageUri, scanId]);

  const runDiagnose = useCallback(async () => {
    if (!routeImageUri) return;
    setUploadState('uploading');
    try {
      const result = await diagnose(routeImageUri);
      await addComplete(scanId, routeImageUri, result.disease, result.confidence);
      setLocalResult(result);
      setUploadState('done');
    } catch {
      setUploadState('error');
    }
  }, [routeImageUri, scanId, addComplete]);

  useEffect(() => {
    if (storeScan || !routeImageUri) return;
    runDiagnose();
    // Only ever run the upload once per mount — retries are user-initiated via runDiagnose().
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeScan == null, routeImageUri]);

  const activeScan = storeScan ?? fallbackScan ?? undefined;
  const imageUri = activeScan?.imageUri ?? routeImageUri;
  const disease = activeScan && activeScan.disease !== PENDING_DISEASE ? activeScan.disease : localResult?.disease;
  const confidence = activeScan && activeScan.disease !== PENDING_DISEASE ? activeScan.confidence : localResult?.confidence;
  const isPending = activeScan?.disease === PENDING_DISEASE;

  const goBackHome = () => router.push('/home');

  if (!imageUri) {
    return (
      <SafeAreaView className="flex-1 bg-surface-app" edges={['top']}>
        <ScreenHeader title={t('diagnose.resultTitle')} onBack={() => router.back()} />
        <EmptyState
          icon="🌱"
          title={t('diagnose.captureTitle')}
          body={t('diagnose.captureHint')}
          actionLabel={t('diagnose.captureButton')}
          onAction={() => router.replace('/diagnose/capture')}
        />
      </SafeAreaView>
    );
  }

  if (isPending) {
    return (
      <SafeAreaView className="flex-1 bg-surface-app" edges={['top']}>
        <ScreenHeader title={t('diagnose.resultTitle')} onBack={goBackHome} />
        <ScrollView contentContainerClassName="gap-5 px-4 pb-12 pt-2">
          <Image
            source={{ uri: imageUri }}
            style={{ width: '100%', height: 220, borderRadius: 16 }}
            contentFit="cover"
          />
          <View className="items-center gap-3 rounded-2xl border border-border bg-surface shadow-sm p-6">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-state-warning-bg">
              <Text className="text-3xl">📡</Text>
            </View>
            <Text className="text-center font-sans-bold text-base text-ink-primary">
              {t('diagnose.analyzing')}
            </Text>
            <Text className="text-center text-sm leading-5 text-ink-secondary">
              {t('connectivity.offlineBadge')}
            </Text>
            <Text className="text-xs text-ink-muted">✓ {t('diagnose.savedToHistory')}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!disease && (uploadState === 'uploading' || uploadState === 'idle')) {
    return (
      <SafeAreaView className="flex-1 bg-surface-app" edges={['top']}>
        <ScreenHeader title={t('diagnose.resultTitle')} onBack={() => router.back()} />
        <View className="flex-1 items-center justify-center gap-4 px-8">
          <Image
            source={{ uri: imageUri }}
            style={{ width: 160, height: 160, borderRadius: 16 }}
            contentFit="cover"
          />
          <ActivityIndicator size="large" color="#0B3B24" />
          <Text className="text-center font-sans-bold text-base text-ink-primary">
            {t('diagnose.analyzing')}
          </Text>
          <Text className="text-center text-sm text-ink-secondary">{t('diagnose.analyzingHint')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!disease && uploadState === 'error') {
    return (
      <SafeAreaView className="flex-1 bg-surface-app" edges={['top']}>
        <ScreenHeader title={t('diagnose.resultTitle')} onBack={() => router.back()} />
        <EmptyState
          icon="⚠️"
          title={t('diagnose.resultTitle')}
          body={t('treatment.offlineNotCached')}
          actionLabel={t('common.retry')}
          onAction={runDiagnose}
        />
      </SafeAreaView>
    );
  }

  const confidenceValue = confidence ?? 0;
  const isLowConfidence = confidenceValue < CONFIDENCE_THRESHOLD;
  const diseaseName = t(`diagnose.diseaseNames.${disease}`, { defaultValue: disease ?? '' });
  const speechText = `${diseaseName}. ${t(
    isLowConfidence ? 'diagnose.confidenceLow' : 'diagnose.confidenceHigh',
  )}.`;

  return (
    <SafeAreaView className="flex-1 bg-surface-app" edges={['top']}>
      <ScreenHeader title={t('diagnose.resultTitle')} onBack={goBackHome} />
      <ScrollView contentContainerClassName="gap-5 px-4 pb-12 pt-2">
        <Image
          source={{ uri: imageUri }}
          style={{ width: '100%', height: 220, borderRadius: 16 }}
          contentFit="cover"
        />

        <View
          className={`gap-3 rounded-2xl border p-4 shadow-sm ${
            isLowConfidence ? 'border-state-warning-bg bg-state-warning-bg/40' : 'border-border bg-surface'
          }`}
        >
          <View className="flex-row items-center justify-between">
            <Text className="flex-1 font-sans-bold text-xl text-ink-primary" numberOfLines={2}>
              {diseaseName}
            </Text>
            <SpeakerButton text={speechText} compact />
          </View>
          <ConfidenceBar confidence={confidenceValue} />
          <Text className="text-xs text-ink-muted">✓ {t('diagnose.savedToHistory')}</Text>
        </View>

        {isLowConfidence ? (
          <View className="gap-3 rounded-2xl bg-state-warning-bg p-4">
            <Text className="font-sans-bold text-sm text-state-warning">
              {t('diagnose.lowConfidenceCaution')}
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="min-h-[48px] flex-1 items-center justify-center rounded-full border border-state-warning bg-transparent"
                onPress={() => router.replace('/diagnose/capture')}
                accessibilityRole="button"
              >
                <Text className="font-sans-bold text-sm text-state-warning">
                  {t('diagnose.retake')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="min-h-[48px] flex-1 items-center justify-center rounded-full bg-state-warning"
                onPress={() => Linking.openURL(EXPERT_HELPLINE)}
                accessibilityRole="button"
              >
                <Text className="font-sans-bold text-sm text-white">
                  {t('diagnose.contactExpert')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            className="min-h-[52px] items-center justify-center rounded-full bg-brand-primary"
            onPress={() => router.push({ pathname: '/treatment/[disease]', params: { disease: disease!, scanId } })}
            accessibilityRole="button"
          >
            <Text className="font-sans-bold text-base text-white">{t('diagnose.viewTreatment')}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
