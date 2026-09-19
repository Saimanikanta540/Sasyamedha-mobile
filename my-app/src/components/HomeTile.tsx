import { Text, TouchableOpacity } from 'react-native';

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
      className={`mb-3 w-[48%] min-h-[104px] rounded-2xl border p-4 shadow-sm ${
        isPrimary ? 'border-brand-primary bg-brand-primary' : 'border-border bg-surface'
      }`}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`${label} — ${sublabel}`}
    >
      <Text className="mb-2 text-3xl">{icon}</Text>
      <Text
        className={`font-sans-bold text-base ${isPrimary ? 'text-white' : 'text-ink-primary'}`}
        numberOfLines={2}
      >
        {label}
      </Text>
      <Text
        className={`mt-0.5 text-xs ${isPrimary ? 'text-white/80' : 'text-ink-secondary'}`}
        numberOfLines={2}
      >
        {sublabel}
      </Text>
    </TouchableOpacity>
  );
}
