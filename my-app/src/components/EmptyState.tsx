import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors, fontSize, radii, spacing } from '@/theme/tokens';

interface EmptyStateProps {
  icon?: string;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * Every screen renders this (or OfflineState) instead of a blank view when
 * there is nothing to show — the empty state is part of the design, not a
 * fallback bolted on afterwards (brief §5.2).
 */
export function EmptyState({ icon = '🌱', title, body, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.action} onPress={onAction} accessibilityRole="button">
          <Text style={styles.actionLabel}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  icon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: 'NotoSans_700Bold',
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  body: {
    fontFamily: 'NotoSans_400Regular',
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  action: {
    marginTop: spacing.md,
    backgroundColor: colors.brandPrimary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    minHeight: 44,
    justifyContent: 'center',
  },
  actionLabel: {
    color: colors.textInverse,
    fontFamily: 'NotoSans_700Bold',
    fontSize: fontSize.sm,
  },
});
