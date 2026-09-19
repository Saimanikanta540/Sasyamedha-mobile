import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, radii, spacing } from '@/theme/tokens';

/** Marks a cached/offline result as stale so staleness is never hidden. */
export function StaleBadge({ label }: { label: string }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.warningBg,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  text: {
    color: colors.warning,
    fontFamily: 'NotoSans_700Bold',
    fontSize: fontSize.xs,
  },
});
