import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { useLanguage } from '@/hooks/use-language';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '@/i18n';
import { clearCache, getCacheSizeKb, getLastSyncAt } from '@/lib/storage/cache-info';

const NOTIFICATIONS_KEY = 'scc.notificationsEnabled';

const LANGUAGE_LABEL_KEY: Record<SupportedLanguage, string> = {
  te: 'settings.languageTelugu',
  en: 'settings.languageEnglish',
  hi: 'settings.languageHindi',
};

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const [cacheSizeKb, setCacheSizeKb] = useState(0);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const refreshCacheInfo = async () => {
    setCacheSizeKb(await getCacheSizeKb());
    setLastSync(await getLastSyncAt());
  };

  useEffect(() => {
    refreshCacheInfo();
    AsyncStorage.getItem(NOTIFICATIONS_KEY).then((v) => setNotificationsEnabled(v === 'true'));
  }, []);

  const onToggleNotifications = async (value: boolean) => {
    if (value) {
      try {
        // Loaded lazily — the native module throws on eager import in Expo Go on
        // newer Android SDKs, and this toggle is the only place that needs it.
        const Notifications = await import('expo-notifications');
        const { status } = await Notifications.requestPermissionsAsync();
        value = status === 'granted';
      } catch {
        value = false;
      }
    }
    setNotificationsEnabled(value);
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, String(value));
  };

  const onClearCache = () => {
    Alert.alert(t('settings.clearCacheConfirmTitle'), t('settings.clearCacheConfirmBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('settings.clearCache'),
        style: 'destructive',
        onPress: async () => {
          await clearCache();
          await refreshCacheInfo();
          Alert.alert(t('settings.cacheCleared'));
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-app" edges={['top']}>
      <ScreenHeader title={t('settings.title')} onBack={() => router.back()} />

      <ScrollView className="flex-1 px-4 pt-5" contentContainerClassName="gap-6 pb-12">
        <View className="gap-3">
          <Text className="font-sans-bold text-sm text-ink-secondary">{t('settings.language')}</Text>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang}
              className={`min-h-[56px] flex-row items-center justify-between rounded-xl border px-4 py-3 ${
                language === lang ? 'border-brand-primary bg-brand-primary' : 'border-border bg-surface'
              }`}
              onPress={() => setLanguage(lang)}
              accessibilityRole="button"
            >
              <Text
                className={`font-sans-bold text-base ${language === lang ? 'text-white' : 'text-ink-primary'}`}
              >
                {t(LANGUAGE_LABEL_KEY[lang])}
              </Text>
              {language === lang && <Text className="text-white">✓</Text>}
            </TouchableOpacity>
          ))}
        </View>

        <View className="gap-2 rounded-xl border border-border bg-surface shadow-sm p-4">
          <Text className="font-sans-bold text-sm text-ink-secondary">{t('settings.cacheSummary')}</Text>
          <View className="flex-row justify-between">
            <Text className="text-sm text-ink-secondary">{t('settings.cacheSize')}</Text>
            <Text className="font-sans-bold text-sm text-ink-primary">
              {t('settings.cacheSizeValue', { size: cacheSizeKb })}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-sm text-ink-secondary">{t('settings.lastSync')}</Text>
            <Text className="font-sans-bold text-sm text-ink-primary">
              {lastSync ? new Date(lastSync).toLocaleString() : t('settings.lastSyncNever')}
            </Text>
          </View>
          <TouchableOpacity
            className="mt-2 min-h-[44px] items-center justify-center rounded-full bg-state-danger-bg px-4 py-2.5"
            onPress={onClearCache}
            accessibilityRole="button"
          >
            <Text className="font-sans-bold text-sm text-state-danger">{t('settings.clearCache')}</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center justify-between rounded-xl border border-border bg-surface shadow-sm p-4">
          <View className="flex-1 pr-3">
            <Text className="font-sans-bold text-sm text-ink-primary">{t('settings.notifications')}</Text>
            <Text className="mt-0.5 text-xs text-ink-secondary">{t('settings.notificationsSub')}</Text>
          </View>
          <Switch value={notificationsEnabled} onValueChange={onToggleNotifications} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
