import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConnectivityBadge } from '@/components/ConnectivityBadge';
import { HomeTile } from '@/components/HomeTile';

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();

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
    <SafeAreaView className="flex-1 bg-surface-app" edges={['top']}>
      <View className="flex-row items-start justify-between px-4 pb-2 pt-3">
        <View className="gap-2">
          <Text className="font-sans-bold text-xl text-brand-primary">{t('common.appName')}</Text>
          <ConnectivityBadge />
        </View>
        <TouchableOpacity
          className="h-11 w-11 items-center justify-center rounded-full bg-surface-muted"
          onPress={() => router.push('/settings')}
          accessibilityRole="button"
          accessibilityLabel={t('home.settings')}
        >
          <Text className="text-lg">⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerClassName="flex-row flex-wrap justify-between px-4 pb-24">
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
        className="absolute bottom-6 flex-row items-center gap-2 self-center rounded-full bg-brand-accent px-6 py-3"
        onPress={() => router.push('/voice')}
        accessibilityRole="button"
        accessibilityLabel={t('home.voiceAssistant')}
      >
        <Text className="text-lg">🎙️</Text>
        <Text className="font-sans-bold text-sm text-white">{t('home.voiceAssistant')}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
