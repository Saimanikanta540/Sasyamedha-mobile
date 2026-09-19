import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, radii, spacing } from '@/theme/tokens';

/** Non-dismissible by design — no close button, ever. */
export function DisclaimerBanner({ text }: { text: string }) {
  return (
    <View style={styles.banner} accessibilityRole="text">
      <Text style={styles.icon}>ℹ️</Text>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.infoBg,
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: 'flex-start',
  },
  icon: {
    fontSize: fontSize.md,
  },
  text: {
    flex: 1,
    color: colors.info,
    fontFamily: 'NotoSans_500Medium',
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
});
