import { ReactNode } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  right?: ReactNode;
}

/** Shared header for secondary screens — back button, title (+ optional subtitle), and an
 * optional right-hand accessory — so every screen beyond Home reads as one cohesive app. */
export function ScreenHeader({ title, subtitle, onBack, right }: ScreenHeaderProps) {
  return (
    <View className="flex-row items-center gap-3 px-4 pb-3 pt-2">
      <TouchableOpacity
        className="h-10 w-10 items-center justify-center rounded-full bg-surface-muted"
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Back"
      >
        <Text className="text-xl text-ink-primary">←</Text>
      </TouchableOpacity>
      <View className="flex-1">
        <Text className="font-sans-bold text-lg text-ink-primary" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text className="text-xs text-ink-secondary" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}
