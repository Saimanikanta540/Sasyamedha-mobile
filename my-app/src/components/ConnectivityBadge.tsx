import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useIsOnline } from '@/lib/network/connectivity';
import { colors, fontSize, radii, spacing } from '@/theme/tokens';

/** Persistent connectivity indicator required on every screen (brief §8). */
export function ConnectivityBadge() {
  const isOnline = useIsOnline();
  const { t } = useTranslation();

  return (
    <View
      style={[styles.badge, { backgroundColor: isOnline ? colors.successBg : colors.warningBg }]}
      accessibilityRole="text"
      accessibilityLabel={isOnline ? t('connectivity.onlineBadge') : t('connectivity.offlineBadge')}
    >
      <View style={[styles.dot, { backgroundColor: isOnline ? colors.success : colors.warning }]} />
      <Text style={[styles.label, { color: isOnline ? colors.success : colors.warning }]} numberOfLines={1}>
        {isOnline ? t('connectivity.onlineBadge') : t('connectivity.offlineBadge')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    alignSelf: 'flex-start',
    gap: spacing.xs,
    maxWidth: '100%',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    flexShrink: 1,
  },
});
