import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import { colors, fontSize, minTouchTarget, radii, shadow, spacing } from '@/theme/tokens';

interface HomeTileProps {
  icon: string;
  label: string;
  sublabel: string;
  onPress: () => void;
  tone?: 'primary' | 'default';
}

/** Six large tiles, min 64dp tap target, no nested menus (brief §3). */
export function HomeTile({ icon, label, sublabel, onPress, tone = 'default' }: HomeTileProps) {
  const isPrimary = tone === 'primary';
  return (
    <TouchableOpacity
      style={[styles.tile, isPrimary && styles.tilePrimary]}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`${label} — ${sublabel}`}
    >
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.label, isPrimary && styles.labelPrimary]} numberOfLines={2}>
        {label}
      </Text>
      <Text style={[styles.sublabel, isPrimary && styles.sublabelPrimary]} numberOfLines={2}>
        {sublabel}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: '48%',
    minHeight: minTouchTarget + 40,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  tilePrimary: {
    backgroundColor: colors.brandPrimary,
    borderColor: colors.brandPrimary,
  },
  icon: {
    fontSize: 30,
    marginBottom: spacing.sm,
  },
  label: {
    fontFamily: 'NotoSans_700Bold',
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  labelPrimary: {
    color: colors.textInverse,
  },
  sublabel: {
    fontFamily: 'NotoSans_400Regular',
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sublabelPrimary: {
    color: 'rgba(255,255,255,0.8)',
  },
});
