import { Text, View } from 'react-native';

/** Marks a cached/offline result as stale so staleness is never hidden. */
export function StaleBadge({ label }: { label: string }) {
  return (
    <View className="self-start rounded-full bg-state-warning-bg px-3 py-1">
      <Text className="font-sans-bold text-xs text-state-warning">{label}</Text>
    </View>
  );
}
