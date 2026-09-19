import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Animated, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RecordingPresets, requestRecordingPermissionsAsync, useAudioRecorder } from 'expo-audio';

import { LinearGradient } from '@/components/LinearGradient';
import { transcribeVoice } from '@/lib/api/endpoints';
import { ApiError, hasBackendConfigured } from '@/lib/api/client';

type Phase = 'idle' | 'listening' | 'transcribing' | 'result' | 'error';

const ROUTES: { keywords: string[]; route: Parameters<ReturnType<typeof useRouter>['push']>[0] }[] = [
  { keywords: ['scan', 'photo', 'leaf', 'diagnose', 'disease', 'sick', 'crop health'], route: '/diagnose/capture' },
  { keywords: ['treatment', 'cure', 'spray', 'blight', 'medicine', 'pesticide'], route: '/treatment' },
  { keywords: ['price', 'rate', 'mandi', 'market'], route: '/prices' },
  { keywords: ['sell', 'best return', 'where to sell', 'best price'], route: '/sell' },
  { keywords: ['storage', 'cold storage', 'store my', 'warehouse'], route: '/storage' },
  { keywords: ['transport', 'vehicle', 'truck', 'lorry', 'logistics'], route: '/transport' },
];

function matchRoute(transcriptEn: string) {
  const lower = transcriptEn.toLowerCase();
  return ROUTES.find((r) => r.keywords.some((k) => lower.includes(k)))?.route;
}

const AUTO_NAVIGATE_DELAY_MS = 1400;

export default function VoiceAssistantScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [phase, setPhase] = useState<Phase>('idle');
  const [transcript, setTranscript] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [pulse] = useState(new Animated.Value(1));

  useEffect(() => {
    if (phase === 'listening') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.2, duration: 800, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        ]),
      ).start();
    } else {
      pulse.stopAnimation();
      pulse.setValue(1);
    }
  }, [phase, pulse]);

  useEffect(
    () => () => {
      if (navigateTimer.current) clearTimeout(navigateTimer.current);
    },
    [],
  );

  const startListening = async () => {
    setErrorMessage(null);
    if (!hasBackendConfigured()) {
      setErrorMessage(t('voice.noBackend'));
      setPhase('error');
      return;
    }
    const { granted } = await requestRecordingPermissionsAsync();
    if (!granted) {
      setErrorMessage(t('voice.noPermission'));
      setPhase('error');
      return;
    }
    try {
      await recorder.prepareToRecordAsync();
      recorder.record();
      setPhase('listening');
    } catch {
      setErrorMessage(t('voice.recordFailed'));
      setPhase('error');
    }
  };

  const stopAndTranscribe = async () => {
    setPhase('transcribing');
    try {
      await recorder.stop();
      const uri = recorder.uri;
      if (!uri) throw new Error('no recording uri');

      const result = await transcribeVoice(uri);
      setTranscript(result.transcript);
      setPhase('result');

      const destination = matchRoute(result.transcriptEn);
      navigateTimer.current = setTimeout(() => {
        if (destination) router.push(destination);
      }, AUTO_NAVIGATE_DELAY_MS);
    } catch (err) {
      setErrorMessage(
        err instanceof ApiError && err.status === 0 ? t('voice.networkError') : t('voice.transcribeFailed'),
      );
      setPhase('error');
    }
  };

  const resetAndListenAgain = () => {
    if (navigateTimer.current) clearTimeout(navigateTimer.current);
    setTranscript(null);
    setErrorMessage(null);
    startListening();
  };

  const onMicPress = () => {
    if (phase === 'idle' || phase === 'error' || phase === 'result') {
      resetAndListenAgain();
    } else if (phase === 'listening') {
      stopAndTranscribe();
    }
  };

  const matchedRoute = phase === 'result' ? matchRoute(transcript ?? '') : undefined;

  const goNow = () => {
    if (navigateTimer.current) clearTimeout(navigateTimer.current);
    if (matchedRoute) router.push(matchedRoute);
  };

  const headline =
    phase === 'listening'
      ? t('voice.headlineListening')
      : phase === 'transcribing'
        ? t('voice.headlineTranscribing')
        : phase === 'result'
          ? transcript
          : phase === 'error'
            ? errorMessage
            : t('voice.headlineIdle');

  const subline =
    phase === 'listening'
      ? t('voice.sublineListening')
      : phase === 'result'
        ? matchedRoute
          ? t('voice.sublineRouting')
          : t('voice.sublineNoMatch')
        : phase === 'error'
          ? t('voice.sublineError')
          : t('voice.sublineIdle');

  return (
    <View className="flex-1 bg-surface-app">
      <LinearGradient colors={['#10B981', '#059669', '#047857']} className="flex-1">
        <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
          <View className="flex-row items-center gap-3 px-4 py-4 justify-between">
            <TouchableOpacity
              className="h-12 w-12 items-center justify-center rounded-full bg-white/20"
              onPress={() => router.back()}
              accessibilityRole="button"
            >
              <Text className="text-xl text-white">✕</Text>
            </TouchableOpacity>
            <View className="bg-white/20 px-4 py-1.5 rounded-full">
              <Text className="font-sans-bold text-sm text-white uppercase tracking-widest">
                {t('home.voiceAssistant')}
              </Text>
            </View>
            <View className="w-12 h-12" />
          </View>

          <View className="flex-1 items-center justify-center gap-12 px-8">
            <View className="h-40 justify-end">
              <Text className="text-center font-sans-bold text-3xl text-white leading-[42px]">{headline}</Text>
              <Text className="text-center text-lg text-white/70 mt-4">{subline}</Text>
            </View>

            <View className="items-center justify-center h-48 w-48">
              {phase === 'listening' && (
                <Animated.View
                  style={{ transform: [{ scale: pulse }] }}
                  className="absolute h-40 w-40 rounded-full bg-white/20"
                />
              )}
              {phase === 'listening' && (
                <Animated.View
                  style={{ transform: [{ scale: Animated.multiply(pulse, 1.1) }] }}
                  className="absolute h-48 w-48 rounded-full bg-white/10"
                />
              )}
              <TouchableOpacity
                disabled={phase === 'transcribing'}
                className={`h-28 w-28 items-center justify-center rounded-full shadow-lg ${
                  phase === 'listening' ? 'bg-white' : 'bg-brand-accent'
                } ${phase === 'transcribing' ? 'opacity-60' : ''}`}
                style={{ elevation: 10 }}
                onPress={onMicPress}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={t('home.voiceAssistant')}
              >
                {phase === 'transcribing' ? (
                  <ActivityIndicator size="large" color="#ffffff" />
                ) : (
                  <Text className="text-5xl">{phase === 'listening' ? '⏹' : '🎙️'}</Text>
                )}
              </TouchableOpacity>
            </View>

            {phase === 'idle' && (
              <View className="flex-row gap-3 flex-wrap justify-center mt-8">
                {[t('voice.promptPrices'), t('voice.promptTreatment'), t('voice.promptLogistics')].map((prompt) => (
                  <View key={prompt} className="bg-white/15 px-4 py-2 rounded-full border border-white/20">
                    <Text className="text-white text-sm font-sans-bold">{prompt}</Text>
                  </View>
                ))}
              </View>
            )}

            {phase === 'result' && (
              <View className="flex-row gap-3 mt-4">
                {matchedRoute && (
                  <TouchableOpacity
                    className="rounded-full bg-white px-6 py-3"
                    onPress={goNow}
                    accessibilityRole="button"
                  >
                    <Text className="font-sans-bold text-sm text-brand-primary">{t('voice.goNow')}</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  className="rounded-full border border-white/40 bg-white/10 px-6 py-3"
                  onPress={resetAndListenAgain}
                  accessibilityRole="button"
                >
                  <Text className="font-sans-bold text-sm text-white">{t('voice.askAgain')}</Text>
                </TouchableOpacity>
              </View>
            )}

            {phase === 'error' && (
              <TouchableOpacity
                className="mt-4 rounded-full bg-white px-6 py-3"
                onPress={resetAndListenAgain}
                accessibilityRole="button"
              >
                <Text className="font-sans-bold text-sm text-brand-primary">{t('common.retry')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
