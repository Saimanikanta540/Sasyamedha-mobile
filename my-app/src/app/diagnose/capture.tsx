import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { generateId } from '@/lib/id';
import { useIsOnline } from '@/lib/network/connectivity';
import { persistCapturedImage } from '@/lib/storage/captured-images';
import { useOutboxStore } from '@/stores/outboxStore';
import { useScanHistoryStore } from '@/stores/scanHistoryStore';

export default function CaptureScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const isOnline = useIsOnline();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const addPending = useScanHistoryStore((s) => s.addPending);
  const enqueueDiagnose = useOutboxStore((s) => s.enqueueDiagnose);

  const onCapture = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      if (photo?.uri) setPhotoUri(photo.uri);
    } finally {
      setCapturing(false);
    }
  };

  const onUsePhoto = async () => {
    if (!photoUri || submitting) return;
    setSubmitting(true);
    const scanId = generateId('scan');
    try {
      if (isOnline) {
        router.replace({
          pathname: '/diagnose/result',
          params: { scanId, imageUri: photoUri },
        });
      } else {
        const persistedUri = await persistCapturedImage(photoUri, scanId);
        await addPending(scanId, persistedUri);
        await enqueueDiagnose({ scanId, imageUri: persistedUri });
        router.replace({
          pathname: '/diagnose/result',
          params: { scanId, imageUri: persistedUri, offline: '1' },
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!permission) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-surface-app">
        <Text className="text-sm text-ink-secondary">{t('common.loading')}</Text>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-surface-app" edges={['top']}>
        <Header onBack={() => router.back()} title={t('diagnose.captureTitle')} />
        <EmptyState
          icon="📷"
          title={t('diagnose.permissionTitle')}
          body={t('diagnose.permissionBody')}
          actionLabel={t('diagnose.permissionGrant')}
          onAction={requestPermission}
        />
      </SafeAreaView>
    );
  }

  if (photoUri) {
    return (
      <SafeAreaView className="flex-1 bg-black" edges={['top', 'bottom']}>
        <Header dark onBack={() => setPhotoUri(null)} title={t('diagnose.reviewTitle')} />
        <Image source={{ uri: photoUri }} style={{ flex: 1 }} contentFit="contain" />
        <View className="flex-row gap-3 p-4">
          <TouchableOpacity
            className="min-h-[52px] flex-1 items-center justify-center rounded-full border border-white/40"
            onPress={() => setPhotoUri(null)}
            accessibilityRole="button"
          >
            <Text className="font-sans-bold text-base text-white">{t('diagnose.retake')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="min-h-[52px] flex-1 items-center justify-center rounded-full bg-brand-primary"
            onPress={onUsePhoto}
            disabled={submitting}
            accessibilityRole="button"
          >
            <Text className="font-sans-bold text-base text-white">
              {submitting ? t('common.loading') : t('diagnose.usePhoto')}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black" edges={['top', 'bottom']}>
      <Header dark onBack={() => router.back()} title={t('diagnose.captureTitle')} />
      <View className="flex-1">
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />
        <View pointerEvents="none" className="absolute inset-0 items-center justify-center">
          <View className="h-64 w-64 rounded-3xl border-2 border-dashed border-white/70" />
        </View>
        <View className="absolute bottom-0 left-0 right-0 items-center gap-3 p-6">
          <Text className="text-center text-sm font-sans-medium text-white">
            {t('diagnose.captureHint')}
          </Text>
          <TouchableOpacity
            className="h-20 w-20 items-center justify-center rounded-full border-4 border-white/80 bg-white/20"
            onPress={onCapture}
            disabled={capturing}
            accessibilityRole="button"
            accessibilityLabel={t('diagnose.captureButton')}
          >
            <View className="h-16 w-16 rounded-full bg-white" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

function Header({
  title,
  onBack,
  dark,
}: {
  title: string;
  onBack: () => void;
  dark?: boolean;
}) {
  return (
    <View className="flex-row items-center gap-3 px-4 py-3">
      <TouchableOpacity
        className={`h-10 w-10 items-center justify-center rounded-full ${dark ? 'bg-white/15' : 'bg-surface-muted'}`}
        onPress={onBack}
        accessibilityRole="button"
      >
        <Text className={`text-xl ${dark ? 'text-white' : 'text-ink-primary'}`}>←</Text>
      </TouchableOpacity>
      <Text className={`font-sans-bold text-lg ${dark ? 'text-white' : 'text-ink-primary'}`}>
        {title}
      </Text>
    </View>
  );
}
