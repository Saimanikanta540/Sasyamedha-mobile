import { Text, TouchableOpacity, View } from 'react-native';

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
      className={`mb-3.5 w-[48%] min-h-[136px] justify-between rounded-3xl p-4 shadow-md ${
        isPrimary ? 'bg-brand-primary' : 'border border-border bg-surface'
      }`}
      style={{ shadowOpacity: isPrimary ? 0.18 : 0.06, elevation: isPrimary ? 4 : 2 }}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`${label} — ${sublabel}`}
    >
      <View
        className={`h-11 w-11 items-center justify-center rounded-2xl ${
          isPrimary ? 'bg-white/15' : 'bg-surface-app'
        }`}
      >
        <Text className="text-2xl">{icon}</Text>
      </View>
      <View className="gap-0.5">
        <Text
          className={`font-sans-bold text-base ${isPrimary ? 'text-white' : 'text-ink-primary'}`}
          numberOfLines={2}
        >
          {label}
        </Text>
        <Text
          className={`text-xs leading-4 ${isPrimary ? 'text-white/75' : 'text-ink-secondary'}`}
          numberOfLines={2}
        >
          {sublabel}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
