import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConnectivityBadge } from '@/components/ConnectivityBadge';
import { HomeTile } from '@/components/HomeTile';
import { usePendingRequests } from '@/stores/outboxStore';

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { count: pendingCount } = usePendingRequests();

  const tiles: Array<{
    icon: string;
    label: string;
    sublabel: string;
    route: Parameters<typeof router.push>[0];
    primary?: boolean;
  }> = [
    {
      icon: '📷',
      label: t('home.tileDiagnose'),
      sublabel: t('home.tileDiagnoseSub'),
      route: '/diagnose/capture',
    },
    {
      icon: '🌿',
      label: t('home.tileTreat'),
      sublabel: t('home.tileTreatSub'),
      route: '/treatment',
    },
    {
      icon: '📊',
      label: t('home.tilePrices'),
      sublabel: t('home.tilePricesSub'),
      route: '/prices',
    },
    {
      icon: '💰',
      label: t('home.tileSell'),
      sublabel: t('home.tileSellSub'),
      route: '/sell',
      primary: true,
    },
    {
      icon: '❄️',
      label: t('home.tileStore'),
      sublabel: t('home.tileStoreSub'),
      route: '/storage',
    },
    {
      icon: '🚚',
      label: t('home.tileTransport'),
      sublabel: t('home.tileTransportSub'),
      route: '/transport',
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-brand-primary" edges={['top']}>
      <View className="gap-4 px-5 pb-7 pt-2">
        <View className="flex-row items-start justify-between">
          <View className="gap-1.5">
            <Text className="font-sans-bold text-2xl text-white">{t('common.appName')}</Text>
            <ConnectivityBadge />
          </View>
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              className="h-11 w-11 items-center justify-center rounded-full bg-white/15"
              onPress={() => router.push('/history')}
              accessibilityRole="button"
              accessibilityLabel={t('history.title')}
            >
              <Text className="text-lg">🕘</Text>
              {pendingCount > 0 && (
                <View className="absolute -right-1 -top-1 h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-accent px-1">
                  <Text className="font-sans-bold text-[10px] text-white">{pendingCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              className="h-11 w-11 items-center justify-center rounded-full bg-white/15"
              onPress={() => router.push('/settings')}
              accessibilityRole="button"
              accessibilityLabel={t('home.settings')}
            >
              <Text className="text-lg">⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text className="text-sm text-white/70">{t('home.greeting')} 👋</Text>
      </View>

      <View className="flex-1 rounded-t-[32px] bg-surface-app">
        <ScrollView
          contentContainerClassName="flex-row flex-wrap justify-between px-4 pb-28 pt-6"
          showsVerticalScrollIndicator={false}
        >
          {tiles.map((tile) => (
            <HomeTile
              key={tile.label}
              icon={tile.icon}
              label={tile.label}
              sublabel={tile.sublabel}
              tone={tile.primary ? 'primary' : 'default'}
              onPress={() => router.push(tile.route)}
            />
          ))}
        </ScrollView>

        <TouchableOpacity
          className="absolute bottom-6 flex-row items-center gap-2 self-center rounded-full bg-brand-accent px-6 py-3.5 shadow-lg"
          style={{ shadowOpacity: 0.3, elevation: 6 }}
          onPress={() => router.push('/voice')}
          accessibilityRole="button"
          accessibilityLabel={t('home.voiceAssistant')}
        >
          <Text className="text-lg">🎙️</Text>
          <Text className="font-sans-bold text-sm text-white">{t('home.voiceAssistant')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
