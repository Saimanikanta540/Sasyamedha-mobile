import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { useIsOnline } from '@/lib/network/connectivity';

/** Persistent connectivity indicator required on every screen (brief §8). */
export function ConnectivityBadge() {
  const isOnline = useIsOnline();
  const { t } = useTranslation();
  const label = isOnline ? t('connectivity.onlineBadge') : t('connectivity.offlineBadge');

  return (
    <View
      className={`flex-row items-center self-start gap-1.5 rounded-full px-3 py-1 max-w-full ${
        isOnline ? 'bg-state-success-bg' : 'bg-state-warning-bg'
      }`}
      accessibilityRole="text"
      accessibilityLabel={label}
    >
      <View className={`h-2 w-2 rounded-full ${isOnline ? 'bg-state-success' : 'bg-state-warning'}`} />
      <Text
        className={`text-xs font-sans-bold shrink ${isOnline ? 'text-state-success' : 'text-state-warning'}`}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}
