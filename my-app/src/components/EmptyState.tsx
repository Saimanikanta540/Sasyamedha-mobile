import { Text, TouchableOpacity, View } from 'react-native';

interface EmptyStateProps {
  icon?: string;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * Every screen renders this (or a similar offline state) instead of a blank
 * view when there is nothing to show — designed in from the start, not a
 * fallback bolted on afterwards (brief §5.2).
 */
export function EmptyState({ icon = '🌱', title, body, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center gap-2 px-8 py-12">
      <View className="mb-2 h-20 w-20 items-center justify-center rounded-full bg-surface-muted">
        <Text className="text-4xl">{icon}</Text>
      </View>
      <Text className="text-center font-sans-bold text-lg text-ink-primary">{title}</Text>
      <Text className="text-center text-sm leading-5 text-ink-secondary">{body}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity
          className="mt-4 min-h-[48px] justify-center rounded-full bg-brand-primary px-6 py-3 shadow-sm"
          onPress={onAction}
          accessibilityRole="button"
        >
          <Text className="font-sans-bold text-sm text-white">{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
