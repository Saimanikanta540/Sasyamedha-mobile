import { Text, View } from 'react-native';

/** Non-dismissible by design — no close button, ever. */
export function DisclaimerBanner({ text }: { text: string }) {
  return (
    <View
      className="flex-row items-start gap-2 rounded-xl bg-state-info-bg p-3"
      accessibilityRole="text"
    >
      <Text className="text-base">ℹ️</Text>
      <Text className="flex-1 font-sans-medium text-sm leading-5 text-state-info">{text}</Text>
    </View>
  );
}
