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
    <View className="items-center justify-center gap-2 px-6 py-12">
      <Text className="mb-1 text-5xl">{icon}</Text>
      <Text className="text-center font-sans-bold text-lg text-ink-primary">{title}</Text>
      <Text className="text-center text-sm leading-5 text-ink-secondary">{body}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity
          className="mt-3 min-h-[44px] justify-center rounded-full bg-brand-primary px-6 py-3"
          onPress={onAction}
          accessibilityRole="button"
        >
          <Text className="font-sans-bold text-sm text-white">{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
